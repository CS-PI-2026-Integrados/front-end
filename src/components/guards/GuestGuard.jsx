import { Navigate, Outlet } from 'react-router-dom'
import { useSession } from '@/context/SessionContext'
import { Loader2 } from 'lucide-react'

export default function GuestGuard() {
  const { session, isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    )
  }

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
