import { z } from 'zod'
import { validateCPF } from '@/shared/lib/cpf'

const addressSchema = z.object({
  zipCode: z.string().optional().default(''),
  street: z.string().trim().min(1, 'O logradouro é obrigatório.'),
  number: z.string().trim().min(1, 'O número é obrigatório.'),
  complement: z.string().optional().default(''),
  neighborhood: z.string().trim().min(1, 'O bairro é obrigatório.'),
  city: z.string().trim().min(1, 'A cidade é obrigatória.'),
  state: z.string().trim().min(1, 'A UF é obrigatória.'),
})

const processSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  status: z.string().optional(),
  principal: z.boolean(),
})

export const convictedFormSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório.'),
  cpf: z
    .string()
    .trim()
    .min(1, 'O CPF é obrigatório.')
    .refine((val) => val.replace(/\D/g, '').length >= 11, 'O CPF é obrigatório.')
    .refine(validateCPF, 'CPF inválido.'),
  birthDate: z.string().trim().min(1, 'A data de nascimento é obrigatória.'),
  phone: z
    .string()
    .trim()
    .min(1, 'O telefone é obrigatório.')
    .refine((val) => val.replace(/\D/g, '').length >= 10, 'O telefone é obrigatório.'),
  address: addressSchema,
  processes: z.array(processSchema).optional(),
})

export function validateConvictedForm(form, { isEditing = false, preview = null } = {}) {
  const result = convictedFormSchema.safeParse(form || {})
  const erros = {}

  if (!isEditing && !form?.photo && !preview) {
    erros.photo = 'A foto é obrigatória.'
  }

  if (!result.success && result.error) {
    const issues = Array.isArray(result.error.issues)
      ? result.error.issues
      : Array.isArray(result.error.errors)
        ? result.error.errors
        : []

    issues.forEach((err) => {
      const path = err?.path || []
      const key = path.length > 1 ? `address.${path[1]}` : path[0]
      if (key && !erros[key]) {
        erros[key] = err.message
      }
    })
  }

  return erros
}
