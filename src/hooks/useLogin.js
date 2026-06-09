import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/schemas/authSchemas'
import { authenticateUser } from '@/services/authService'
import { useSession } from '@/context/sessionContext'

export function useLogin() {
  const { handleLogin } = useSession()
  const form = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const signIn = async (data) => {
    form.clearErrors('root')

    try {
      const response = await authenticateUser(data.cpf, data.password)

      handleLogin(response.user, response.tenant, response.token)
    } catch (error) {
      form.setError('root', {
        type: 'server',
        message: error.message || 'Ocorreu um erro inesperado.',
      })
    }
  }

  return {
    form,
    signIn,
  }
}
