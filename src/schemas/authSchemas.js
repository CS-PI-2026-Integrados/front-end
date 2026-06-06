import { z } from 'zod'
import { validateCPF } from '@/lib/validadorCpf'

const cpfSchema = z
  .string()
  .trim()
  .min(14, 'Preencha o CPF completo.')
  .refine(validateCPF, 'CPF inválido.')

const requiredPassword = (message) => z.string().min(1, message)

export const loginSchema = z.object({
  cpf: cpfSchema,
  password: requiredPassword('A senha é obrigatória.'),
})

export const recoverPasswordSchema = z.object({
  cpf: cpfSchema,
})

export const resetPasswordSchema = z
  .object({
    newPassword: requiredPassword('A nova senha é obrigatória.'),
    confirmPassword: requiredPassword('Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não conferem.',
  })
