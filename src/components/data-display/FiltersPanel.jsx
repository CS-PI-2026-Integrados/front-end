import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function FiltersPanel({ children, className, description, title = 'Filtros' }) {
  return (
    <Card className={cn('gap-0 py-0 shadow-sm', className)}>
      <CardHeader className="py-5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-5">
        <div className="flex flex-col gap-3 lg:flex-row">{children}</div>
      </CardContent>
    </Card>
  )
}
