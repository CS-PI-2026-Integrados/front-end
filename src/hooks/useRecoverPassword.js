import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recoverPasswordSchema } from '@/schemas/recoverPasswordSchema'
import { requestPasswordReset } from '@/services/authService'
import { formatCpf } from '@/lib/validadorCpf'

const RECOVERY_MESSAGE = 'Se este CPF estiver cadastrado, você receberá um link de acesso em breve.'

export function useRecoverPassword() {
  const [successMessage, setSuccessMessage] = useState('')
  const form = useForm({
    resolver: zodResolver(recoverPasswordSchema),
    mode: 'onTouched',
  })

  const requestResetLink = async (data) => {
    setSuccessMessage('')

    await requestPasswordReset(data.cpf)
    setSuccessMessage(RECOVERY_MESSAGE)
    form.reset()
  }

  return {
    form,
    formatCpf,
    successMessage,
    requestResetLink,
  }
}
