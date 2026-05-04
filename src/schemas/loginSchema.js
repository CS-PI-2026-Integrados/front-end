import { z } from 'zod'
import { validateCPF } from '@/lib/validadorCpf'

export const loginSchema = z.object({
  cpf: z.string().min(14, 'Preencha o CPF completo').refine(validateCPF, 'CPF inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})
