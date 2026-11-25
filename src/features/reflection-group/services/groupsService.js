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
  participants: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
  total_meetings_count: z.number().nullable().optional(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).nullable().optional(),
  start_date: z.string().nullable().optional(),
  predicted_end_date: z.string().nullable().optional(),
  real_end_date: z.string().nullable().optional(),
})
const membershipSchema = z.object({
  uuid: z.string(),
  convicted_uuid: z.string(),
  convicted_name: z.string(),
  start_date: z.string(),
  end_date: z.string().nullable().optional(),
})
const detailSchema = listSchema.omit({ participant_count: true }).extend({
  description: z.string().nullable().optional(),
  total_meetings_counts: z.number(),
  minimum_meetings_count: z.number(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']),
  meeting_base_time: z.string().nullable().optional(),
  start_date: z.string(),
  predicted_end_date: z.string().nullable().optional(),
  real_end_date: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  convicteds: z.array(z.object({ id: z.string(), name: z.string(), document: z.string() })),
  participant_memberships: z.array(membershipSchema).optional(),
})
const meetingAttendanceSchema = z.object({
  convicted_uuid: z.string(),
  convicted_name: z.string(),
  membership_uuid: z.string().nullable(),
  status: z.enum(['PRESENTE', 'AUSENTE', 'JUSTIFICADO']),
  justification_type: z
    .enum(['ATESTADO', 'DETERMINACAO_JUDICIAL', 'FORCA_MAIOR', 'OUTRO'])
    .nullable(),
  justification_text: z.string().nullable(),
})
const meetingSchema = z.object({
  uuid: z.string(),
  date: z.string(),
  subject: z.string(),
  status: z.enum(['PENDENTE', 'REALIZADO', 'CANCELADO']),
  version: z.number(),
  attendance: z.array(meetingAttendanceSchema),
})
const toListItem = (item) => ({
  id: item.uuid,
  name: item.name,
  subject: item.subject,
  presenters: item.presenters,
  status: item.status,
  participantCount: item.participant_count,
  participants: item.participants?.map((person) => ({
    id: person.id,
    fullName: person.name,
  })),
  totalMeetingsCount: item.total_meetings_count ?? item.total_meetings_counts,
  frequency: item.frequency,
  startDate: item.start_date,
  predictedEndDate: item.predicted_end_date ?? null,
  realEndDate: item.real_end_date ?? null,
})
const toDetail = (item) => ({
  ...toListItem({ ...item, participant_count: item.convicteds.length }),
  description: item.description ?? null,
  totalMeetingsCount: item.total_meetings_counts ?? item.total_meetings_count,
  minimumMeetingsCount: item.minimum_meetings_count,
  frequency: item.frequency,
  meetingBaseTime: item.meeting_base_time ?? null,
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
  participantMemberships: (item.participant_memberships ?? []).map((membership) => ({
    id: membership.uuid,
    convictedId: membership.convicted_uuid,
    convictedName: membership.convicted_name,
    startDate: membership.start_date,
    endDate: membership.end_date ?? null,
  })),
})
const detail = (response) => toDetail(parseApiResponse(detailSchema, response))
const toMeeting = (meeting) => ({
  id: meeting.uuid,
  date: meeting.date,
  subject: meeting.subject,
  status: meeting.status,
  version: meeting.version,
  attendance: meeting.attendance.map((record) => ({
    convictedId: record.convicted_uuid,
    convictedName: record.convicted_name,
    membershipId: record.membership_uuid,
    status: record.status,
    justificationType: record.justification_type,
    justificationText: record.justification_text,
  })),
})
const toMeetingRequest = (meeting) => ({
  uuid: meeting.id,
  date: meeting.date,
  subject: meeting.subject,
  status: meeting.status,
  version: meeting.version ?? null,
  attendance: meeting.attendance.map((record) => ({
    convicted_uuid: record.convictedId,
    status: record.status,
    justification_type: record.justificationType ?? null,
    justification_text: record.justificationText ?? null,
  })),
})
const sameIds = (left, right) => left.size === right.size && [...left].every((id) => right.has(id))
const participantSaveError = (cause, message) =>
  new ApiRequestError(message, {
    status: cause.status ?? null,
    body: cause.body ?? null,
    kind: cause.kind ?? 'backend',
    fields: cause.fields ?? [],
    cause,
  })

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
  async getMeetings(id, options) {
    return parseApiResponse(
      z.array(meetingSchema),
      await apiService.get(`/group/${id}/meetings`, options)
    ).map(toMeeting)
  },
  async syncMeetings(id, meetings, options) {
    return parseApiResponse(
      z.array(meetingSchema),
      await apiService.put(`/group/${id}/meetings`, meetings.map(toMeetingRequest), options)
    ).map(toMeeting)
  },
  async importLegacyMeetings(id, meetings, options) {
    return parseApiResponse(
      z.array(meetingSchema),
      await apiService.post(`/group/${id}/meetings/import`, meetings.map(toMeetingRequest), options)
    ).map(toMeeting)
  },
  /** Creates a PLANNED group, optionally linking convictedUuids atomically. */
  async create(input, options) {
    const data = parseApiInput(groupCreateSchema, input)
    return detail(
      await apiService.post(
        '/group',
        {
          name: data.name,
          description: data.description?.trim() || null,
          subject: data.subject,
          presenters: data.presenters,
          total_meetings_count: data.totalMeetingsCount,
          minimum_meetings_count: data.minimumMeetingsCount,
          meeting_base_time: data.meetingBaseTime || null,
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
    const names = {
      startDate: 'start_date',
      predictedEndDate: 'predicted_end_date',
      meetingBaseTime: 'meeting_base_time',
    }
    return detail(
      await apiService.put(
        `/group/${id}`,
        Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            names[key] || key,
            key === 'description'
              ? value?.trim() || null
              : key === 'meetingBaseTime'
                ? value || null
                : value,
          ])
        ),
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
  /** Reconciles participant links only and returns the authoritative group. */
  async saveParticipants(id, input, options) {
    const groupId = parseApiInput(groupParticipantIdSchema, id)
    const { participantIds } = parseApiInput(
      z.object({
        participantIds: z
          .array(groupParticipantIdSchema)
          .refine((ids) => new Set(ids).size === ids.length, 'Não repita participantes.'),
      }),
      input
    )
    const current = await groupsService.getById(groupId, options)
    const existing = new Set(current.convicteds.map((person) => person.id))
    const desired = new Set(participantIds)
    const removals = [...existing].filter((personId) => !desired.has(personId))
    const additions = [...desired].filter((personId) => !existing.has(personId))

    if (!removals.length && !additions.length) return current
    if (!['PLANNED', 'ACTIVE'].includes(current.status)) {
      throw Object.assign(
        new ApiRequestError(
          'Os participantes só podem ser alterados em grupos em planejamento ou em andamento.'
        ),
        { currentGroup: current, possiblyChanged: false, partialSuccess: false }
      )
    }

    try {
      for (const personId of removals) {
        await groupsService.removeConvicted(groupId, personId, options)
      }
      for (const personId of additions) {
        await groupsService.addConvicted(groupId, personId, options)
      }
      return await groupsService.getById(groupId, options)
    } catch (cause) {
      if (cause.name === 'AbortError') throw cause

      let currentGroup = null
      try {
        currentGroup = await groupsService.getById(groupId, options)
      } catch (readError) {
        if (readError.name === 'AbortError') throw readError
      }
      if (!currentGroup) {
        throw Object.assign(
          participantSaveError(
            cause,
            'Não foi possível confirmar as alterações de participantes. Tente salvar novamente para consultar os vínculos atuais.'
          ),
          { currentGroup: null, possiblyChanged: true, partialSuccess: false }
        )
      }

      const currentIds = new Set(currentGroup.convicteds.map((person) => person.id))
      if (sameIds(currentIds, desired)) return currentGroup

      const partialSuccess = !sameIds(currentIds, existing)
      throw Object.assign(
        participantSaveError(
          cause,
          partialSuccess
            ? 'Nem todas as alterações de participantes foram concluídas. O estado atual foi reconciliado; tente salvar novamente.'
            : cause.message || 'Não foi possível salvar os participantes.'
        ),
        { currentGroup, possiblyChanged: partialSuccess, partialSuccess }
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
