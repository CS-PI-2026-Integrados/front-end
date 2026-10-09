import { z } from 'zod'

export const groupStatuses = {
  PLANNED: 'Planejamento',
  ACTIVE: 'Em andamento',
  CLOSED: 'Concluído',
}
export const groupFrequencies = { WEEKLY: 'Semanal', BIWEEKLY: 'Quinzenal', MONTHLY: 'Mensal' }
const required = z.string().trim().min(1, 'Campo obrigatório.')
const date = z.iso.date({ error: 'Informe uma data válida.' })
// The API also accepts development UUIDs without RFC version/variant bits.
export const groupParticipantIdSchema = z.guid({ error: 'Selecione um apenado válido.' })
export const groupCreateSchema = z
  .object({
    name: required,
    description: required,
    subject: required,
    presenters: z.array(required).min(1, 'Informe pelo menos um ministrante.'),
    totalMeetingsCount: z.coerce
      .number({ error: 'Informe um número de encontros.' })
      .int('Informe um número inteiro.')
      .min(1, 'Informe pelo menos um encontro.'),
    minimumMeetingsCount: z.coerce
      .number({ error: 'Informe um número de encontros.' })
      .int('Informe um número inteiro.')
      .min(1, 'Informe pelo menos um encontro.'),
    meetingBaseTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe o horário HH:mm.'),
    frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY'], { error: 'Selecione a frequência.' }),
    startDate: date,
    predictedEndDate: z.union([date, z.literal(''), z.null()]).optional(),
    convictedUuids: z.array(groupParticipantIdSchema).default([]),
  })
  .refine((data) => data.minimumMeetingsCount <= data.totalMeetingsCount, {
    path: ['minimumMeetingsCount'],
    message: 'O mínimo não pode superar o total de encontros.',
  })
  .refine((data) => !data.predictedEndDate || data.predictedEndDate >= data.startDate, {
    path: ['predictedEndDate'],
    message: 'O término não pode ser anterior ao início.',
  })
export const groupUpdateSchema = z
  .object({
    name: required.optional(),
    subject: required.optional(),
    presenters: z.array(required).min(1).optional(),
    status: z.enum(['PLANNED', 'ACTIVE', 'CLOSED']).optional(),
    startDate: date.optional(),
    predictedEndDate: z.union([date, z.null()]).optional(),
  })
  .strict()

const participantsSchema = z
  .array(
    z.object({
      id: groupParticipantIdSchema,
      fullName: z.string(),
      cpf: z.string(),
    })
  )
  .refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
    'Não adicione o mesmo apenado mais de uma vez.'
  )
const presentersInput = z.preprocess(
  (value) =>
    typeof value === 'string'
      ? value
          .split('\n')
          .map((name) => name.trim())
          .filter(Boolean)
      : value,
  z.array(required).min(1, 'Informe pelo menos um ministrante.')
)

export function getGroupFormSchema(group) {
  if (!group)
    return groupCreateSchema.safeExtend({
      presenters: presentersInput,
      participants: participantsSchema,
    })
  return z
    .object({
      name: required,
      subject: required,
      presenters: presentersInput,
      status: z.enum(['PLANNED', 'ACTIVE', 'CLOSED'], { error: 'Selecione o status.' }),
      startDate: date,
      predictedEndDate: z.union([date, z.literal(''), z.null()]).optional(),
      participants: participantsSchema,
    })
    .refine((data) => !data.predictedEndDate || data.predictedEndDate >= data.startDate, {
      path: ['predictedEndDate'],
      message: 'O término não pode ser anterior ao início.',
    })
}
