import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'

export default function MustChangePasswordGuard() {
  const { session } = useSession()
  const mustChangePassword = Boolean(session?.user?.mustChangePassword)

  if (mustChangePassword) {
    return <Navigate to="/definir-senha" replace />
  }

  return <Outlet />
}
