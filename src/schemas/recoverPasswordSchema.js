import { z } from 'zod'
import { cpfSchema } from '@/schemas/commonFieldsSchema'

export const recoverPasswordSchema = z.object({
  cpf: cpfSchema,
})
