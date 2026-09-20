import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

function getPageItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages]
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis-start',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [
    1,
    'ellipsis-start',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-end',
    totalPages,
  ]
}

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  const pageItems = getPageItems(currentPage, totalPages)
  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  return (
    <nav aria-label="Paginação" className={`flex items-center gap-1.5 ${className}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        aria-label="Ir para a página anterior"
        className="border-primary/25 text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        <ChevronLeft />
      </Button>

      <div className="hidden items-center gap-1 sm:flex">
        {pageItems.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span
                key={item}
                aria-hidden="true"
                className="text-muted-foreground inline-flex size-8 items-center justify-center"
              >
                <Ellipsis className="size-4" />
              </span>
            )
          }

          const isCurrent = item === currentPage

          return (
            <Button
              key={item}
              type="button"
              variant={isCurrent ? 'default' : 'outline'}
              size="icon-sm"
              onClick={() => onPageChange(item)}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Ir para a página ${item}`}
              className={
                isCurrent
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'border-primary/25 text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground'
              }
            >
              {item}
            </Button>
          )
        })}
      </div>

      <span className="bg-primary text-primary-foreground inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-semibold shadow-xs sm:hidden">
        {currentPage}
      </span>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        aria-label="Ir para a próxima página"
        className="border-primary/25 text-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
