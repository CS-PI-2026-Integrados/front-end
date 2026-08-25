import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'

export function DataTableCard({
  children,
  className,
  count,
  emptyState,
  footer,
  icon,
  isEmpty = false,
  isLoading = false,
  loadingMessage = 'Carregando registros...',
  title,
}) {
  return (
    <Card className={cn('gap-0 py-0', className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {typeof count === 'number' && (
            <p className="text-muted-foreground mt-1 text-sm">{count} registro(s) encontrado(s)</p>
          )}
        </div>
        {icon}
      </CardHeader>
      <CardContent className="px-0">
        {isLoading ? (
          <div className="text-muted-foreground flex min-h-48 items-center justify-center border-t text-sm">
            {loadingMessage}
          </div>
        ) : isEmpty ? (
          emptyState
        ) : (
          children
        )}
      </CardContent>
      {!isLoading && !isEmpty && footer}
    </Card>
  )
}
