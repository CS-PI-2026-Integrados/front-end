import { useLayoutEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { readAuthSession } from '@/services/authService'
import { Loader2 } from 'lucide-react'

const buildRequestedRoute = (location) => {
  return `${location.pathname}${location.search}${location.hash}`
}

const buildLoginRedirectPath = (requestedRoute) => {
  return `/login?redirect=${encodeURIComponent(requestedRoute)}`
}

const GuardLoader = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  )
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
    return <GuardLoader />
  }

  if (!readAuthSession()) {
    return <InvalidSessionRedirect to={buildLoginRedirectPath(requestedRoute)} />
  }

  return <Outlet />
}
