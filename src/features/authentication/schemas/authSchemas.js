import { z } from 'zod'
import { cpfSchema, passwordSchema } from '@/shared/schemas/fieldSchemas'

export const loginSchema = z.object({
  cpf: cpfSchema,
  password: passwordSchema('A senha é obrigatória.'),
})

export const recoverPasswordSchema = z.object({
  cpf: cpfSchema,
})

export const definePasswordSchema = z
  .object({
    newPassword: passwordSchema('A nova senha é obrigatória.'),
    confirmPassword: passwordSchema('Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })
