import { Pagination } from '@/shared/components/ui/pagination'

export function TablePagination({ currentPage, totalPages, totalItems, onPageChange }) {
  return (
    <div className="text-muted-foreground flex flex-col gap-3 border-t px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium">
        Página {currentPage} de {totalPages} · {totalItems} registros
      </span>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  )
}
