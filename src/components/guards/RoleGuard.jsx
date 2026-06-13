import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'

export default function RoleGuard({ canAccess, redirectTo = '/' }) {
  const { session } = useSession()

  if (!canAccess(session?.user)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
