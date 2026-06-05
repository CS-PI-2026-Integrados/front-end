import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/context/sessionContext'
import { readAuthSession } from '@/services/authService'
import RouteGuardLoader from '@/components/guards/RouteGuardLoader'

const isInternalRedirect = (redirect) => {
  return redirect?.startsWith('/') && !redirect.startsWith('//')
}

const getPathname = (route) => {
  return route.split(/[?#]/)[0] || '/'
}

const getAuthenticatedRedirectPath = (location) => {
  const redirect = new URLSearchParams(location.search).get('redirect')?.trim()

  if (!isInternalRedirect(redirect) || getPathname(redirect) === location.pathname) {
    return '/dashboard'
  }

  return redirect
}

export default function GuestGuard() {
  const { isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return <RouteGuardLoader />
  }

  if (readAuthSession()) {
    return <Navigate to={getAuthenticatedRedirectPath(location)} replace />
  }

  return <Outlet />
}
