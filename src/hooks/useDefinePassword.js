import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { definePasswordSchema } from '@/schemas/authSchemas'
import {
  definePasswordForRequiredChange,
  definePasswordWithResetToken,
  validatePasswordResetToken,
} from '@/services/authService'
import { useSession } from '@/features/autenticacao/context/sessionContext'

const FLOW_STATUS = {
  LOADING: 'loading',
  VALID: 'valid',
  INVALID: 'invalid',
}

export function useDefinePassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session, isLoading, handleLogout, handleRestoreSession } = useSession()
  const token = searchParams.get('token') || ''
  const isResetTokenFlow = Boolean(token)
  const isRequiredChangeFlow = !isResetTokenFlow && Boolean(session?.user?.mustChangePassword)
  const [tokenValidation, setTokenValidation] = useState({
    status: token ? FLOW_STATUS.LOADING : FLOW_STATUS.VALID,
    token,
  })
  const form = useForm({
    resolver: zodResolver(definePasswordSchema),
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
    if (!isResetTokenFlow) return

    let shouldUpdateState = true

    validatePasswordResetToken(token).then((isValidToken) => {
      if (!shouldUpdateState) return

      setTokenValidation({
        status: isValidToken ? FLOW_STATUS.VALID : FLOW_STATUS.INVALID,
        token,
      })
    })

    return () => {
      shouldUpdateState = false
    }
  }, [isResetTokenFlow, token])

  useEffect(() => {
    if (isResetTokenFlow || isLoading) return

    if (!session) {
      navigate('/login', { replace: true })
      return
    }

    if (!session.user.mustChangePassword) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isResetTokenFlow, navigate, session])

  const status = useMemo(() => {
    if (isResetTokenFlow) {
      return tokenValidation.token === token ? tokenValidation.status : FLOW_STATUS.LOADING
    }

    if (isLoading) return FLOW_STATUS.LOADING
    if (isRequiredChangeFlow) return FLOW_STATUS.VALID

    return FLOW_STATUS.LOADING
  }, [isLoading, isRequiredChangeFlow, isResetTokenFlow, token, tokenValidation])

  const definePassword = async (data) => {
    try {
      if (isResetTokenFlow) {
        await definePasswordWithResetToken(token, data.newPassword)
        toast.success('Senha redefinida com sucesso. \nFaça login com a nova senha.')
        navigate('/login', { replace: true })
        return
      }

      await definePasswordForRequiredChange(session, data.newPassword)
      await handleRestoreSession()
      toast.success('Senha redefinida com sucesso.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (isResetTokenFlow) {
        setTokenValidation({
          status: FLOW_STATUS.INVALID,
          token,
        })
      } else {
        form.setError('root', { message: error.message })
      }
    }
  }

  const returnToLogin = () => {
    handleLogout()
    navigate('/login', { replace: true })
  }

  return {
    definePassword,
    form,
    isRequiredChangeFlow,
    newPassword,
    returnToLogin,
    status,
  }
}
