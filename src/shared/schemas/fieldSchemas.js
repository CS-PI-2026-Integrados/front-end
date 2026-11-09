import { z } from 'zod'
import { validateCPF } from '@/shared/lib/cpf'

export const cpfSchema = z
  .string()
  .trim()
  .min(14, 'Preencha o CPF completo.')
  .refine(validateCPF, 'CPF inválido.')

export const optionalPhoneSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim() || null : value),
  z
    .string()
    .regex(/^(?:[1-9]\d|\([1-9]\d\))\s?\d{4,5}-?\d{4}$/, 'Informe um telefone válido com DDD.')
    .transform((value) => value.replace(/\D/g, ''))
    .nullish()
)

export const passwordSchema = (message = 'A senha é obrigatória.') => z.string().min(1, message)
