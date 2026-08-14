import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/features/autenticacao/context/sessionContext'
import { RouteLoader } from '@/shared/ui/RouteLoader'

export default function AuthGuard() {
  const { isLoading, session } = useSession()
  const location = useLocation()

  if (isLoading) {
    return <RouteLoader />
  }

  if (!session) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          `${location.pathname}${location.search}${location.hash}`
        )}`}
        replace
      />
    )
  }

  return <Outlet />
}
