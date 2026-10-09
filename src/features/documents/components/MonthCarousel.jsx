import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function MonthCarousel({
  countByMonth,
  selectedMonth,
  onSelectMonth,
  onPreviousYear,
  onNextYear,
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="shrink-0"
        disabled={!onPreviousYear}
        onClick={onPreviousYear}
        aria-label="Ano anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div
        role="group"
        aria-label="Meses do ano"
        className="flex min-w-0 flex-1 gap-1 overflow-x-auto"
      >
        {MONTHS.map((month, index) => {
          const isSelected = selectedMonth === index + 1
          const count = countByMonth[index] ?? 0

          return (
            <Button
              key={month}
              type="button"
              variant={isSelected ? 'default' : 'ghost'}
              aria-pressed={isSelected}
              disabled={count === 0}
              onClick={() => onSelectMonth(index + 1)}
              className={cn(
                'min-w-16 flex-1 shrink-0 gap-1.5',
                !isSelected && 'text-muted-foreground'
              )}
            >
              {month}{' '}
              {count > 0 && (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-semibold',
                    isSelected
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {count}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="shrink-0"
        disabled={!onNextYear}
        onClick={onNextYear}
        aria-label="Próximo ano"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
