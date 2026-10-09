import { z } from 'zod'
import { apiService, ApiRequestError } from '@/shared/infrastructure/http/apiService'
import {
  parseApiResponse,
  parseApiInput,
  parsePage,
  pageParamsSchema,
} from '@/shared/infrastructure/http/apiContracts'
import {
  groupCreateSchema,
  groupUpdateSchema,
  groupParticipantIdSchema,
} from '../schemas/groupSchemas'

const listSchema = z.object({
  uuid: z.string(),
  name: z.string(),
  subject: z.string(),
  presenters: z.array(z.string()),
  status: z.enum(['PLANNED', 'ACTIVE', 'CLOSED']),
  participant_count: z.number(),
  total_meetings_count: z.number().nullable().optional(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).nullable().optional(),
  start_date: z.string().nullable().optional(),
  predicted_end_date: z.string().nullable().optional(),
  real_end_date: z.string().nullable().optional(),
})
const detailSchema = listSchema.omit({ participant_count: true }).extend({
  description: z.string(),
  total_meetings_counts: z.number(),
  minimum_meetings_count: z.number(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
  meeting_base_time: z.string(),
  start_date: z.string(),
  predicted_end_date: z.string().nullable().optional(),
  real_end_date: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  convicteds: z.array(z.object({ id: z.string(), name: z.string(), document: z.string() })),
})
const toListItem = (item) => ({
  id: item.uuid,
  name: item.name,
  subject: item.subject,
  presenters: item.presenters,
  status: item.status,
  participantCount: item.participant_count,
  totalMeetingsCount: item.total_meetings_count ?? item.total_meetings_counts,
  frequency: item.frequency,
  startDate: item.start_date,
  predictedEndDate: item.predicted_end_date ?? null,
  realEndDate: item.real_end_date ?? null,
})
const toDetail = (item) => ({
  ...toListItem({ ...item, participant_count: item.convicteds.length }),
  description: item.description,
  totalMeetingsCount: item.total_meetings_counts ?? item.total_meetings_count,
  minimumMeetingsCount: item.minimum_meetings_count,
  frequency: item.frequency,
  meetingBaseTime: item.meeting_base_time,
  startDate: item.start_date,
  predictedEndDate: item.predicted_end_date ?? null,
  realEndDate: item.real_end_date ?? null,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
  convicteds: item.convicteds.map((person) => ({
    id: person.id,
    fullName: person.name,
    cpf: person.document,
  })),
})
const detail = (response) => toDetail(parseApiResponse(detailSchema, response))

/** Official /group contract. Canonical camelCase models; throws ApiRequestError. */
export const groupsService = {
  /** Lists by name/subject/status, zero-based page, size 1..100; accepts signal. */
  async list({ name, subject, status, page = 0, size = 20, signal, timeoutMs } = {}) {
    const params = new URLSearchParams(parseApiInput(pageParamsSchema, { page, size }))
    for (const [key, value] of Object.entries({ name, subject, status }))
      if (value?.trim()) params.set(key, value.trim())
    return parsePage(
      await apiService.get(`/group?${params}`, { signal, timeoutMs }),
      listSchema,
      toListItem
    )
  },
  /** Gets a group's full planning and participants. */
  async getById(id, options) {
    return detail(await apiService.get(`/group/${id}`, options))
  },
  /** Creates a PLANNED group, optionally linking convictedUuids atomically. */
  async create(input, options) {
    const data = parseApiInput(groupCreateSchema, input)
    return detail(
      await apiService.post(
        '/group',
        {
          name: data.name,
          description: data.description,
          subject: data.subject,
          presenters: data.presenters,
          total_meetings_count: data.totalMeetingsCount,
          minimum_meetings_count: data.minimumMeetingsCount,
          meeting_base_time: data.meetingBaseTime,
          frequency: data.frequency,
          start_date: data.startDate,
          predicted_end_date: data.predictedEndDate || null,
          convicted_uuids: data.convictedUuids,
        },
        options
      )
    )
  },
  /** Updates supported metadata only. Participants have dedicated operations. */
  async update(id, input, options) {
    const data = parseApiInput(groupUpdateSchema, input)
    const names = { startDate: 'start_date', predictedEndDate: 'predicted_end_date' }
    return detail(
      await apiService.put(
        `/group/${id}`,
        Object.fromEntries(Object.entries(data).map(([key, value]) => [names[key] || key, value])),
        options
      )
    )
  },
  /** Reconcile memberships before metadata/status. Every retry reads authoritative state first. */
  async saveChanges(id, input, options) {
    const { metadata, participantIds } = parseApiInput(
      z.object({
        metadata: groupUpdateSchema,
        participantIds: z
          .array(groupParticipantIdSchema)
          .refine((ids) => new Set(ids).size === ids.length, 'Não repita participantes.'),
      }),
      input
    )
    const current = await groupsService.getById(id, options)
    const existing = new Set(current.convicteds.map((person) => person.id))
    const desired = new Set(participantIds)
    const remove = [...existing].filter((personId) => !desired.has(personId))
    const add = [...desired].filter((personId) => !existing.has(personId))
    if ((remove.length || add.length) && current.status !== 'PLANNED') {
      throw Object.assign(
        new ApiRequestError('Os participantes só podem ser alterados em grupos em planejamento.'),
        { currentGroup: current }
      )
    }
    if (current.status !== 'PLANNED' && metadata.startDate !== undefined) {
      if (metadata.startDate !== current.startDate)
        throw new ApiRequestError('O início só pode ser alterado em grupos em planejamento.', {
          kind: 'validation',
          fields: [{ field: 'startDate', message: 'O início deste grupo não pode ser alterado.' }],
        })
      delete metadata.startDate
    }
    if (
      metadata.predictedEndDate &&
      metadata.predictedEndDate < (metadata.startDate || current.startDate)
    ) {
      throw new ApiRequestError('Verifique as datas informadas.', {
        kind: 'validation',
        fields: [
          { field: 'predictedEndDate', message: 'O término não pode ser anterior ao início.' },
        ],
      })
    }
    let attempted = false
    try {
      for (const personId of remove) {
        attempted = true
        await groupsService.removeConvicted(id, personId, options)
      }
      for (const personId of add) {
        attempted = true
        await groupsService.addConvicted(id, personId, options)
      }
      attempted = true
      return await groupsService.update(id, metadata, options)
    } catch (cause) {
      let currentGroup = null
      try {
        currentGroup = await groupsService.getById(id, options)
      } catch {
        /* A retry must read again before writing. */
      }
      throw Object.assign(
        new ApiRequestError(
          currentGroup
            ? 'O salvamento não foi concluído. Os vínculos foram conferidos; alterações já aplicadas não serão repetidas. Tente salvar novamente.'
            : 'Não foi possível confirmar todas as alterações. Ao tentar novamente, o sistema consultará os vínculos antes de continuar.',
          { cause, fields: cause.fields || [] }
        ),
        { currentGroup, possiblyChanged: attempted }
      )
    }
  },
  /** Removes the group; resolves to null. */
  remove: (id, options) => apiService.delete(`/group/${id}`, options),
  /** Links a participant; success has no body. Caller must reload detail. */
  addConvicted: (groupId, convictedId, options) =>
    apiService.post(`/group/${groupId}/convicted/${convictedId}`, undefined, options),
  /** Unlinks a participant; resolves to null. Caller must reload detail. */
  removeConvicted: (groupId, convictedId, options) =>
    apiService.delete(`/group/${groupId}/convicted/${convictedId}`, options),
}
