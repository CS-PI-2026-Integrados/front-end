import { z } from 'zod'
import { validateCPF } from '@/shared/lib/cpf'

export const convictedFormSchema = z.object({
  nomeCompleto: z.string().trim().min(1, 'O nome é obrigatório.'),
  cpf: z
    .string()
    .trim()
    .min(1, 'O CPF é obrigatório.')
    .refine((val) => val.replace(/\D/g, '').length >= 11, 'O CPF é obrigatório.')
    .refine(validateCPF, 'CPF inválido.'),
  dataNascimento: z.string().trim().min(1, 'A data de nascimento é obrigatória.'),
  telefone: z
    .string()
    .trim()
    .min(1, 'O telefone é obrigatório.')
    .refine((val) => val.replace(/\D/g, '').length >= 10, 'O telefone é obrigatório.'),
  cep: z.string().optional().default(''),
  logradouro: z.string().trim().min(1, 'O logradouro é obrigatório.'),
  numero: z.string().trim().min(1, 'O número é obrigatório.'),
  complemento: z.string().optional().default(''),
  bairro: z.string().trim().min(1, 'O bairro é obrigatório.'),
  cidade: z.string().trim().min(1, 'A cidade é obrigatória.'),
  uf: z.string().trim().min(1, 'A UF é obrigatória.'),
  processoId: z.string().trim().min(1, 'O número do processo é obrigatório.'),
  instituicao: z.string().optional().default(''),
  situacaoTrabalhista: z.string().trim().min(1, 'A situação trabalhista é obrigatória.'),
  observacoes: z.string().optional().default(''),
})

export function validateConvictedForm(form, { isEditing = false, preview = null } = {}) {
  const result = convictedFormSchema.safeParse(form || {})
  const erros = {}

  if (!isEditing && !form?.foto && !preview) {
    erros.foto = 'A foto é obrigatória.'
  }

  if (!result.success && result.error) {
    const issues = Array.isArray(result.error.issues)
      ? result.error.issues
      : Array.isArray(result.error.errors)
        ? result.error.errors
        : []

    issues.forEach((err) => {
      const field = err?.path?.[0]
      if (field && !erros[field]) {
        erros[field] = err.message
      }
    })
  }

  return erros
}
