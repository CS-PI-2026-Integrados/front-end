import { useCallback } from 'react'
import { useSession } from '@/features/authentication/context/sessionContext'
import { changePassword } from '@/features/authentication'

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
