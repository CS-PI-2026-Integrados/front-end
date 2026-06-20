import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { resetPasswordSchema } from '@/schemas/authSchemas'
import {
  changeRequiredPassword,
  resetPassword,
  validatePasswordResetToken,
} from '@/services/authService'
import { useSession } from '@/context/sessionContext'

export function useResetPassword({ mandatory = false } = {}) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session, handleLogout, handleRestoreSession } = useSession()
  const token = searchParams.get('token') || ''
  const [tokenStatus, setTokenStatus] = useState(mandatory ? 'valid' : 'loading')
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
    if (mandatory) {
      return
    }

    let shouldUpdateState = true

    validatePasswordResetToken(token).then((isValidToken) => {
      if (!shouldUpdateState) return

      setTokenStatus(isValidToken ? 'valid' : 'invalid')
    })

    return () => {
      shouldUpdateState = false
    }
  }, [mandatory, token])

  const redefinePassword = async (data) => {
    try {
      if (mandatory) {
        await changeRequiredPassword(session, data.newPassword)
        await handleRestoreSession()
        toast.success('Senha redefinida com sucesso.')
        navigate('/dashboard', { replace: true })
        return
      }

      await resetPassword(token, data.newPassword)
      toast.success('Senha redefinida com sucesso. \nFaça login com a nova senha.')
      navigate('/login', { replace: true })
    } catch (error) {
      if (mandatory) {
        form.setError('root', { message: error.message })
      } else {
        setTokenStatus('invalid')
      }
    }
  }

  const returnToLogin = () => {
    handleLogout()
    navigate('/login', { replace: true })
  }

  return {
    form,
    newPassword,
    tokenStatus,
    redefinePassword,
    returnToLogin,
  }
}
