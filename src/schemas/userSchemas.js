import { z } from 'zod'
import { ROLE_KEYS } from '@/lib/userPermissions'
import { validateCPF } from '@/lib/validadorCpf'

const cpfSchema = z
  .string()
  .trim()
  .min(14, 'Preencha o CPF completo.')
  .refine(validateCPF, 'CPF inválido.')

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Informe o nome completo.'),
    cpf: cpfSchema,
    email: z.email('Informe um e-mail válido.').trim().min(1, 'Informe o e-mail de recuperação.'),
    roleKey: z
      .string()
      .min(1, 'Selecione o nível de acesso.')
      .refine((roleKey) => [ROLE_KEYS.OPERATOR, ROLE_KEYS.ADMIN].includes(roleKey), {
        message: 'Selecione o nível de acesso.',
      }),
    password: z.string().min(1, 'Informe a senha.'),
    confirmPassword: z.string().min(1, 'Confirme a senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })
