import { z } from 'zod'

export const loginSchema = z.object({
  cpf: z
    .string()
    .min(14, 'CPF incompleto') // Conta os pontos e traço
    .refine((val) => /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val), 'Formato inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})
