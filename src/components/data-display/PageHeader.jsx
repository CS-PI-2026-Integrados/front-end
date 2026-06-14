import { cn } from '@/lib/utils'

export function PageHeader({ action, className, description, title }) {
  return (
    <div className="mb-4 gap-4 md:flex-row md:items-end">
      <div
        className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}
      >
        <div>
          <h1 className="mb-2 text-3xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
