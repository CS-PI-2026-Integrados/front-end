import { cn } from '@/lib/utils'

export function AuthFormCard({ children, className }) {
  return (
    <div
      className={cn(
        'bg-card text-card-foreground relative z-10 w-full max-w-120 rounded-[8px] px-8 py-12 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
