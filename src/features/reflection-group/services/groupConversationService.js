import { z } from 'zod'
import initialGroups from '../mock/groupsMock.json'
import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { groupsService } from './groupsService'

const legacyStorageKey = 'sicape:grupos-reflexivos:v1'
const conversationSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  description: z.string(),
  minimumMeetings: z.number(),
  source: z.enum(['mock', 'api']),
  participants: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      fullName: z.string(),
      cpf: z.string().optional(),
    })
  ),
  meetings: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      date: z.string(),
      subject: z.string(),
      status: z.enum(['PENDENTE', 'REALIZADO', 'CANCELADO']),
      present: z.array(z.union([z.string(), z.number()])),
      absent: z.array(z.union([z.string(), z.number()])),
      justifications: z.record(z.string(), z.object({ text: z.string(), type: z.string() })),
    })
  ),
})

const storageKey = (scope, id) => `sicape:group-conversation:v1:${scope}:${id}`

function fromLegacy(group) {
  return conversationSchema.parse({
    id: group.id,
    name: group.nome,
    description: group.descricao ?? group.description ?? '',
    minimumMeetings: group.minimoEncontros ?? group.minimoPresencas ?? 0,
    source: 'mock',
    participants: (group.participantes ?? []).map((person) => ({
      id: person.id,
      fullName: person.nome,
      cpf: person.cpf,
    })),
    meetings: (group.encontros ?? []).map((meeting) => ({
      id: meeting.id,
      date: meeting.data.slice(0, 10),
      subject: meeting.tema,
      status: meeting.situacao ?? meeting.status ?? 'PENDENTE',
      present: meeting.presentes ?? [],
      absent:
        meeting.ausentes ??
        ((meeting.situacao ?? meeting.status) === 'REALIZADO'
          ? (group.participantes ?? [])
              .filter(
                (person) =>
                  !(meeting.presentes ?? []).includes(person.id) &&
                  !meeting.justificacoes?.[person.id]
              )
              .map((person) => person.id)
          : []),
      justifications: Object.fromEntries(
        Object.entries(meeting.justificacoes ?? {}).map(([id, value]) => [
          id,
          {
            text: typeof value === 'string' ? value : (value.texto ?? ''),
            type: typeof value === 'string' ? '' : (value.tipo ?? ''),
          },
        ])
      ),
    })),
  })
}

// Meetings are stored locally until the API supports this part of the workflow.
// API metadata and participant links remain owned by groupsService.
export const groupConversationService = {
  async getById(id, scope, options) {
    const legacy = readJson(legacyStorageKey, initialGroups)
    const mock = Array.isArray(legacy) && legacy.find((item) => String(item.id) === String(id))
    if (mock) {
      const saved = readJson(storageKey(scope, id), null)
      return saved ? conversationSchema.parse(saved) : fromLegacy(mock)
    }
    const group = await groupsService.getById(id, options)
    const saved = readJson(storageKey(scope, id), {})
    return conversationSchema.parse({
      id: group.id,
      name: group.name,
      description: group.description,
      minimumMeetings: group.minimumMeetingsCount,
      source: 'api',
      participants: group.convicteds,
      meetings: saved.meetings ?? [],
    })
  },
  save(group, scope) {
    const canonical = conversationSchema.parse(group)
    try {
      writeJson(
        storageKey(scope, group.id),
        canonical.source === 'api' ? { meetings: canonical.meetings } : canonical
      )
    } catch (cause) {
      throw new Error('Não foi possível salvar os dados deste grupo no navegador.', { cause })
    }
    return canonical
  },
  async removeParticipant(group, participantId, scope, options) {
    if (group.source === 'api') {
      await groupsService.removeConvicted(group.id, participantId, options)
      return groupConversationService.getById(group.id, scope, options)
    }
    return groupConversationService.save(
      {
        ...group,
        participants: group.participants.filter((person) => person.id !== participantId),
      },
      scope
    )
  },
}
