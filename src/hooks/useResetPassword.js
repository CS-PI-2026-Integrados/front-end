import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { resetPasswordSchema } from '@/schemas/authSchemas'
import { resetPassword, validatePasswordResetToken } from '@/services/authService'

export function useResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const [tokenStatus, setTokenStatus] = useState('loading')
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })
  const newPassword = useWatch({
    control: form.control,
    name: 'newPassword',
  })

  useEffect(() => {
    let shouldUpdateState = true

    validatePasswordResetToken(token).then((isValidToken) => {
      if (!shouldUpdateState) return

      setTokenStatus(isValidToken ? 'valid' : 'invalid')
    })

    return () => {
      shouldUpdateState = false
    }
  }, [token])

  const redefinePassword = async (data) => {
    try {
      await resetPassword(token, data.newPassword)
      toast.success('Senha redefinida com sucesso. \nFaça login com a nova senha.')
      navigate('/login', { replace: true })
    } catch {
      setTokenStatus('invalid')
    }
  }

  return {
    form,
    newPassword,
    tokenStatus,
    redefinePassword,
  }
}
