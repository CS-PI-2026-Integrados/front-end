import { Loader2 } from 'lucide-react'

export default function RouteGuardLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  )
}
