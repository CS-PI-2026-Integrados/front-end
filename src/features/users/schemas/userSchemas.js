import { z } from 'zod'
import { ROLE_KEYS } from '@/features/users/utils/userPermissionsUtils'
import { cpfSchema } from '@/shared/schemas/fieldSchemas'

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome completo.'),
  cpf: cpfSchema,
  email: z.email('Informe um e-mail válido.').min(1, 'Informe o e-mail de recuperação.').trim(),
  roleKey: z.enum([ROLE_KEYS.OPERATOR, ROLE_KEYS.ADMIN], {
    error: 'Selecione o nível de acesso.',
  }),
})
