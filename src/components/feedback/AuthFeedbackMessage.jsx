import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const variantStyles = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
}

const iconStyles = {
  success: 'text-emerald-600',
}

export function AuthFeedbackMessage({ children, variant = 'success', className }) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-[8px] border px-4 py-3 text-sm leading-5',
        variantStyles[variant],
        className
      )}
    >
      <CheckCircle2 className={cn('mt-0.5 size-5 shrink-0', iconStyles[variant])} />
      <p>{children}</p>
    </div>
  )
}
