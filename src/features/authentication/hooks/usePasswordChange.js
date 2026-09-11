import { useCallback } from 'react'
import { useSession } from '../context/sessionContext'
import { changePassword } from '../services/authService'

export function usePasswordChange() {
  const { session } = useSession()
  const submitPasswordChange = useCallback(
    (currentPassword, newPassword) => {
      if (!session) throw new Error('Sessão inválida')
      return changePassword(session, currentPassword, newPassword)
    },
    [session]
  )

  return { submitPasswordChange }
}
