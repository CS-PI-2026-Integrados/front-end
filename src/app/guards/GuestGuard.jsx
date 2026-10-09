import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/features/authentication'
import { RouteLoader } from '@/shared/components/ui/RouteLoader'

export default function GuestGuard() {
  const { isLoading, session } = useSession()
  const location = useLocation()

  if (isLoading) {
    return <RouteLoader />
  }

  if (session) {
    if (session.user.mustChangePassword) {
      return <Navigate to="/definir-senha" replace />
    }

    const redirect = new URLSearchParams(location.search).get('redirect')?.trim()
    const destination = redirect && redirect !== '/' ? redirect : '/dashboard'

    return <Navigate to={destination} replace />
  }

  return <Outlet />
}
