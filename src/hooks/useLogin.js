import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/schemas/loginSchema'
import { authenticateUser } from '@/services/loginAuth'
import { formatCpf } from '@/lib/validadorCpf'
import { useSession } from '@/hooks/useSession'

export function useLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState('')
  const { handleLogin } = useSession()
  const navigate = useNavigate()

  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

  const signIn = async (data) => {
    setAuthError(null)

    try {
      const response = await authenticateUser(data.cpf, data.password)
      handleLogin(response.user, response.token)
      navigate(`/dashboard`)
    } catch (error) {
      setAuthError(error.message || 'Ocorreu um erro inesperado.')
    } finally {
    }
  }

  return {
    form,
    formatCpf,
    showPassword,
    togglePasswordVisibility,
    authError,
    signIn,
  }
}
