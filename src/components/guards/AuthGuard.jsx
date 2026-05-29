import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import { Loader2 } from 'lucide-react'

export default function AuthGuard() {
  const { session, isLoading } = useSession()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    )
  }

  if (!session) {
    const redirect = location.pathname + location.search
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />
  }

  return <Outlet />
}
