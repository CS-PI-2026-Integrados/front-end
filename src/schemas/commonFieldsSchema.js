import { z } from 'zod'
import { validateCPF } from '@/lib/validadorCpf'

export const cpfSchema = z
  .string()
  .min(14, 'Preencha o CPF completo.')
  .refine(validateCPF, 'CPF inválido.')
