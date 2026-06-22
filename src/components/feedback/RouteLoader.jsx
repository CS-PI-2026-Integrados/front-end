import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RouteLoader({ className }) {
  return (
    <div className={cn('flex min-h-screen w-full items-center justify-center', className)}>
      <Loader2 className="animate-spin text-emerald-500" size={40} />
    </div>
  )
}
