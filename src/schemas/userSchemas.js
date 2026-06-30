import { z } from 'zod'
import { ROLE_KEYS } from '@/lib/userPermissions'
import { cpfSchema, passwordSchema } from './fieldSchemas'

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome completo.'),
    cpf: cpfSchema,
    email: z.email('Informe um e-mail válido.').min(1, 'Informe o e-mail de recuperação.').trim(),
    roleKey: z.enum([ROLE_KEYS.OPERATOR, ROLE_KEYS.ADMIN], {
      error: 'Selecione o nível de acesso.',
    }),
    password: passwordSchema(),
    confirmPassword: passwordSchema('Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })
