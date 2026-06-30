import { z } from 'zod'
import { validateCPF } from '@/lib/validadorCpf'

export const cpfSchema = z
  .string()
  .trim()
  .min(14, 'Preencha o CPF completo.')
  .refine(validateCPF, 'CPF inválido.')

export const passwordSchema = (message = 'A senha é obrigatória.') => z.string().min(1, message)
