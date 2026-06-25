import { cn } from '@/lib/utils'

export function AuthFormCard({ children, className }) {
  return (
    <div
      className={cn(
        'relative z-10 w-full max-w-120 rounded-[8px] bg-white px-8 py-12 text-gray-700 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}
