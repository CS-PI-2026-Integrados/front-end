import { z } from 'zod'
import { cpfSchema } from '@/shared/schemas/fieldSchemas'
import { formatCpf } from '@/shared/lib/cpf'
import { photoSchema } from '@/shared/lib/image'

export const zipCodeSchema = z
  .string()
  .refine((value) => /^\d{8}$/.test(value.replace(/\D/g, '')), 'Informe um CEP com 8 dígitos.')
const addressSchema = z.object({
  zipCode: zipCodeSchema,
  street: z.string().trim().min(1, 'O logradouro é obrigatório.'),
  number: z.string().trim().min(1, 'O número é obrigatório.'),
  complement: z.string().optional().default(''),
  neighborhood: z.string().trim().min(1, 'O bairro é obrigatório.'),
  city: z.string().trim().min(1, 'A cidade é obrigatória.'),
  state: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, 'Informe a UF com duas letras.'),
})
const processesSchema = z
  .array(
    z.object({
      id: z.string().min(1, 'Selecione um processo válido.'),
      number: z.string().min(1, 'Informe o número do processo.'),
      status: z.string().optional(),
      principal: z.boolean(),
      linkedConvictedCount: z.number().optional(),
      linkedConvictedNames: z.array(z.string()).optional(),
    })
  )
  .superRefine((items, context) => {
    if (new Set(items.map((item) => item.id)).size !== items.length)
      context.addIssue({
        code: 'custom',
        message: 'Não adicione o mesmo processo mais de uma vez.',
      })
    if (items.length && items.filter((item) => item.principal).length !== 1)
      context.addIssue({ code: 'custom', message: 'Selecione um único processo principal.' })
  })
export const convictedFormSchema = z.object({
  employmentStatus: z.enum(['FORMAL_WORK', 'INFORMAL_WORK', 'UNEMPLOYED'], {
    error: 'Selecione a situação trabalhista.',
  }),
  name: z.string().trim().min(1, 'O nome é obrigatório.'),
  cpf: z.preprocess((value) => (typeof value === 'string' ? formatCpf(value) : value), cpfSchema),
  birthDate: z.iso.date({ error: 'Informe uma data de nascimento válida.' }),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => [10, 11].includes(value.replace(/\D/g, '').length),
      'Informe um telefone válido com DDD.'
    ),
  address: addressSchema,
  processes: processesSchema.default([]),
  photo: photoSchema.nullable().optional().default(null),
})
export const convictedCreateSchema = convictedFormSchema.extend({ photo: photoSchema })
export const convictedUpdateSchema = convictedFormSchema

export function validateConvictedForm(form, { isEditing = false } = {}) {
  const result = (isEditing ? convictedUpdateSchema : convictedCreateSchema).safeParse(form)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message])
  )
}
