import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { recoverPasswordSchema } from '@/schemas/authSchemas'
import { requestPasswordReset } from '@/services/authService'
import { formatCpf } from '@/lib/validadorCpf'

export function useRecoverPassword() {
  const form = useForm({
    resolver: zodResolver(recoverPasswordSchema),
    mode: 'onTouched',
  })

  const requestResetLink = async (data) => {
    await requestPasswordReset(data.cpf)
    toast.success('Se este CPF estiver cadastrado, você receberá um link de acesso em breve.')
    form.reset()
  }

  return {
    form,
    formatCpf,
    requestResetLink,
  }
}
