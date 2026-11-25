import { z } from 'zod'
import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { groupsService } from './groupsService'

const conversationSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(['PLANNED', 'ACTIVE', 'CLOSED']),
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
      version: z.number().nullable().optional(),
      attendanceCount: z.number().optional(),
      attendance: z
        .array(
          z.object({
            convictedId: z.string(),
            convictedName: z.string(),
            membershipId: z.string().nullable(),
            status: z.enum(['PRESENTE', 'AUSENTE', 'JUSTIFICADO']),
            justificationType: z.string().nullable(),
            justificationText: z.string().nullable(),
          })
        )
        .optional(),
      present: z.array(z.union([z.string(), z.number()])),
      absent: z.array(z.union([z.string(), z.number()])),
      justifications: z.record(z.string(), z.object({ text: z.string(), type: z.string() })),
    })
  ),
})

const storageKey = (scope, id) => `sicape:group-conversation:v1:${scope}:${id}`
const allowedJustificationTypes = new Set([
  'ATESTADO',
  'DETERMINACAO_JUDICIAL',
  'FORCA_MAIOR',
  'OUTRO',
])

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

function toLegacyAttendance(meeting) {
  const participantIds = new Set([
    ...meeting.present,
    ...meeting.absent,
    ...Object.keys(meeting.justifications),
  ])
  return [...participantIds].map((convictedId) => {
    const justification = meeting.justifications[convictedId]
    const status = meeting.present.includes(convictedId)
      ? 'PRESENTE'
      : meeting.absent.includes(convictedId)
        ? 'AUSENTE'
        : 'JUSTIFICADO'
    const type = allowedJustificationTypes.has(justification?.type) ? justification.type : null
    return {
      convictedId,
      status,
      justificationType: status === 'JUSTIFICADO' ? type : null,
      justificationText: status === 'JUSTIFICADO' ? justification?.text || null : null,
    }
  })
}

function fromApiMeeting(meeting) {
  const present = meeting.attendance
    .filter((record) => record.status === 'PRESENTE')
    .map((record) => record.convictedId)
  const absent = meeting.attendance
    .filter((record) => record.status === 'AUSENTE')
    .map((record) => record.convictedId)
  const justifications = Object.fromEntries(
    meeting.attendance
      .filter((record) => record.status === 'JUSTIFICADO')
      .map((record) => [
        record.convictedId,
        {
          text: record.justificationText || '',
          type: record.justificationType || '',
        },
      ])
  )
  return {
    id: meeting.id,
    date: meeting.date,
    subject: meeting.subject,
    status: meeting.status,
    version: meeting.version,
    attendance: meeting.attendance,
    present,
    absent,
    justifications,
    attendanceCount: meeting.attendance.length,
  }
}

function cacheMeetings(scope, id, meetings) {
  try {
    writeJson(storageKey(scope, id), { meetings })
  } catch (cause) {
    throw new Error('Não foi possível salvar os encontros no navegador.', { cause })
  }
}

export const groupConversationService = {
  async getById(id, scope, options) {
    const group = await groupsService.getById(id, options)
    const saved = readJson(storageKey(scope, id), null)
    const hasSavedMeetings = Array.isArray(saved?.meetings) && saved.meetings.length > 0
    let apiMeetings
    if (hasSavedMeetings) {
      apiMeetings = await groupsService.importLegacyMeetings(
        id,
        saved.meetings.map((meeting) => ({
          id: meeting.id,
          date: meeting.date,
          subject: meeting.subject,
          status: meeting.status,
          version: meeting.version ?? null,
          attendance: toLegacyAttendance(meeting),
        })),
        options
      )
    } else {
      apiMeetings = await groupsService.getMeetings(id, options)
    }
    const meetings =
      apiMeetings.length > 0
        ? apiMeetings.map(fromApiMeeting)
        : hasSavedMeetings
          ? saved.meetings
          : generateInitialMeetings(group)
    if (apiMeetings.length > 0 || hasSavedMeetings) cacheMeetings(scope, id, meetings)
    return conversationSchema.parse({
      id: group.id,
      name: group.name,
      description: group.description ?? null,
      status: group.status,
      minimumMeetings: group.minimumMeetingsCount,
      source: 'api',
      participants: group.convicteds,
      meetings,
    })
  },
  async save(group, scope, options) {
    const canonical = conversationSchema.parse(group)
    const meetings = await groupsService.syncMeetings(
      group.id,
      canonical.meetings.map((meeting) => ({
        id: meeting.id,
        date: meeting.date,
        subject: meeting.subject,
        status: meeting.status,
        version: meeting.version ?? null,
        attendance: toLegacyAttendance(meeting),
      })),
      options
    )
    const updated = {
      ...canonical,
      meetings: meetings.map(fromApiMeeting),
    }
    cacheMeetings(scope, group.id, updated.meetings)
    return updated
  },
}
