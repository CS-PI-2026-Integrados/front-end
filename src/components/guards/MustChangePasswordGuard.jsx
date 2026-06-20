import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'

const PASSWORD_CHANGE_PATH = '/alterar-senha'

export default function MustChangePasswordGuard() {
  const { session } = useSession()
  const location = useLocation()
  const mustChangePassword = Boolean(session?.user?.mustChangePassword)

  if (mustChangePassword && location.pathname !== PASSWORD_CHANGE_PATH) {
    return <Navigate to={PASSWORD_CHANGE_PATH} replace />
  }

  if (!mustChangePassword && location.pathname === PASSWORD_CHANGE_PATH) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
