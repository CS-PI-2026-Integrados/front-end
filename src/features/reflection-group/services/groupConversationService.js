import { z } from 'zod'
import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { groupsService } from './groupsService'

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

function generateInitialMeetings(group) {
  const count = group.totalMeetingsCount || 8
  const startDateStr = group.startDate?.slice(0, 10)
  const baseDate = startDateStr ? new Date(`${startDateStr}T00:00:00`) : new Date()
  const frequency = group.frequency || 'WEEKLY'
  const meetings = []

  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate)
    if (frequency === 'WEEKLY') {
      d.setDate(baseDate.getDate() + i * 7)
    } else if (frequency === 'BIWEEKLY') {
      d.setDate(baseDate.getDate() + i * 14)
    } else if (frequency === 'MONTHLY') {
      d.setMonth(baseDate.getMonth() + i)
    } else {
      d.setDate(baseDate.getDate() + i * 7)
    }
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateFormatted = `${year}-${month}-${day}`

    meetings.push({
      id: crypto.randomUUID(),
      date: dateFormatted,
      subject: `Encontro ${i + 1} - ${group.subject || 'Grupo reflexivo'}`,
      status: 'PENDENTE',
      present: [],
      absent: [],
      justifications: {},
    })
  }
  return meetings
}

export const groupConversationService = {
  async getById(id, scope, options) {
    const group = await groupsService.getById(id, options)
    const saved = readJson(storageKey(scope, id), null)
    let meetings = saved?.meetings
    if (!Array.isArray(meetings) || meetings.length === 0) {
      meetings = generateInitialMeetings(group)
      writeJson(storageKey(scope, id), { meetings })
    }
    return conversationSchema.parse({
      id: group.id,
      name: group.name,
      description: group.description,
      minimumMeetings: group.minimumMeetingsCount,
      source: 'api',
      participants: group.convicteds,
      meetings,
    })
  },
  save(group, scope) {
    const canonical = conversationSchema.parse(group)
    try {
      writeJson(storageKey(scope, group.id), { meetings: canonical.meetings })
    } catch (cause) {
      throw new Error('Não foi possível salvar os dados deste grupo no navegador.', { cause })
    }
    return canonical
  },
  async removeParticipant(group, participantId, scope, options) {
    await groupsService.removeConvicted(group.id, participantId, options)
    return groupConversationService.getById(group.id, scope, options)
  },
}
