import { SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyTableState({ className, description, icon, title }) {
  const Icon = icon || SearchX

  return (
    <div
      className={cn(
        'text-muted-foreground flex flex-col items-center justify-center gap-3 border-t py-16 text-center',
        className
      )}
    >
      <Icon className="text-muted-foreground/50 size-12" />
      <p className="text-foreground text-base font-semibold">{title}</p>
      {description && <p className="max-w-md text-sm">{description}</p>}
    </div>
  )
}
