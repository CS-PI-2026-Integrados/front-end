import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'
import { RouteLoader } from '@/components/feedback/RouteLoader'

export default function RoleGuard({ canAccess, redirectTo = '/' }) {
  const { isLoading, session } = useSession()

  if (isLoading) {
    return <RouteLoader />
  }

  if (!canAccess(session?.user)) {
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
