import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function MonthCarousel({ countByMonth, selectedMonth, onSelectMonth }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" disabled aria-label="Mês anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-1 items-center justify-between gap-1">
        {MONTHS.map((month, index) => {
          const total = countByMonth[index]
          const hasRecords = total > 0
          const isSelected = selectedMonth === index

          return (
            <button
              key={month}
              type="button"
              disabled={!hasRecords}
              onClick={() => hasRecords && onSelectMonth(index)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : hasRecords
                    ? 'text-foreground hover:bg-muted'
                    : 'text-muted-foreground/40 cursor-not-allowed'
              )}
            >
              {month}
              {hasRecords && (
                <span
                  className={cn(
                    'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                    isSelected ? 'bg-background text-primary' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {total}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <Button variant="outline" size="icon" disabled aria-label="Próximo mês">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
