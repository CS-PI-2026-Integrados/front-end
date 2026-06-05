import { useLayoutEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'
import { readAuthSession } from '@/services/authService'
import RouteGuardLoader from '@/components/guards/RouteGuardLoader'

const buildRequestedRoute = (location) => {
  return `${location.pathname}${location.search}${location.hash}`
}

const buildLoginRedirectPath = (requestedRoute) => {
  return `/login?redirect=${encodeURIComponent(requestedRoute)}`
}

const InvalidSessionRedirect = ({ to }) => {
  const { handleLogout } = useSession()

  useLayoutEffect(() => {
    handleLogout()
  }, [handleLogout])

  return <Navigate to={to} replace />
}

export default function AuthGuard() {
  const { isLoading } = useSession()
  const location = useLocation()
  const requestedRoute = buildRequestedRoute(location)

  if (isLoading) {
    return <RouteGuardLoader />
  }

  if (!readAuthSession()) {
    return <InvalidSessionRedirect to={buildLoginRedirectPath(requestedRoute)} />
  }

  return <Outlet />
}
