import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recoverPasswordSchema } from '@/features/autenticacao/schemas/authSchemas'
import { requestPasswordReset } from '@/features/autenticacao/services/authService'

const resetLinkRequestedMessage =
  'Se este CPF estiver cadastrado, você receberá um link de acesso no seu e-mail em breve.'

export function useRecoverPassword() {
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const form = useForm({
    resolver: zodResolver(recoverPasswordSchema),
    mode: 'onTouched',
  })

  const requestResetLink = async (data) => {
    setFeedbackMessage('')
    await requestPasswordReset(data.cpf)
    setFeedbackMessage(resetLinkRequestedMessage)
    form.reset()
  }

  return {
    form,
    feedbackMessage,
    requestResetLink,
  }
}
