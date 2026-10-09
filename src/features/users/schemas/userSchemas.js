import { z } from 'zod'
import { ROLE_KEYS } from '@/features/users/utils/userPermissionsUtils'
import { cpfSchema } from '@/shared/schemas/fieldSchemas'

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome completo.'),
  cpf: cpfSchema,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Informe o e-mail de recuperação.')
    .pipe(z.email('Informe um e-mail válido.')),
  roleKey: z.enum([ROLE_KEYS.OPERATOR, ROLE_KEYS.ADMIN], {
    error: 'Selecione o nível de acesso.',
  }),
  password: z
    .string()
    .min(1, 'Informe a senha inicial.')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
      'Use no mínimo 8 caracteres, incluindo letras e números.'
    ),
})
