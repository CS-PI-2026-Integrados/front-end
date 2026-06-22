import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function FiltersPanel({ children, className, description, title = 'Filtros' }) {
  return (
    <Card className={cn('gap-0 py-0 shadow-sm', className)}>
      <CardHeader className="px-4 py-4 sm:px-6 sm:py-5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-5">
        <div className="flex flex-col gap-3 lg:flex-row">{children}</div>
      </CardContent>
    </Card>
  )
}
