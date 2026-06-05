import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'
import { readAuthSession } from '@/services/authService'
import RouteGuardLoader from '@/components/guards/RouteGuardLoader'

export default function GuestGuard() {
  const { isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return <RouteGuardLoader />
  }

  if (readAuthSession()) {
    const redirect = new URLSearchParams(location.search).get('redirect')?.trim()

    return <Navigate to={redirect ? redirect : '/dashboard'} replace />
  }

  return <Outlet />
}
