import { useLayoutEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { readAuthSession } from '@/services/authService'
import RouteGuardLoader from '@/components/guards/RouteGuardLoader'

const DASHBOARD_ROUTE = '/dashboard'

const AuthenticatedSessionRedirect = ({ to }) => {
  const { handleRestoreSession } = useSession()

  useLayoutEffect(() => {
    handleRestoreSession()
  }, [handleRestoreSession])

  return <Navigate to={to} replace />
}

const GuestRouteOutlet = () => {
  const { handleLogout } = useSession()

  useLayoutEffect(() => {
    handleLogout()
  }, [handleLogout])

  return <Outlet />
}

export default function GuestGuard() {
  const { isLoading } = useSession()

  if (isLoading) {
    return <RouteGuardLoader />
  }

  if (readAuthSession()) {
    return <AuthenticatedSessionRedirect to={DASHBOARD_ROUTE} />
  }

  return <GuestRouteOutlet />
}
