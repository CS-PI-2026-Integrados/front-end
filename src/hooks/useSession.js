import { useContext } from 'react'
import { SessionContext } from '@/context/sessionContext'

export const useSession = () => {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession deve ser usado dentro do SessionProvider')
  }

  return context
}
