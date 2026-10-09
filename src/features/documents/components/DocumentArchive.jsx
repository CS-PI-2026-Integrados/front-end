import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { CardDescription } from '@/shared/components/ui/card'
import { Pagination } from '@/shared/components/ui/pagination'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { useDocuments } from '../hooks/useDocuments'
import { YearSelector } from './YearSelector'
import { MonthCarousel } from './MonthCarousel'
import { DocumentSearch } from './DocumentSearch'
import { AttendanceDocumentGrid, AttendanceDocumentList } from './AttendanceDocuments'

export function DocumentArchive({
  tenantId,
  source,
  initialSearch = '',
  onViewPhoto,
  onViewPdf,
  onDownloadPdf,
  onOpenPdf,
  isProcessing = false,
}) {
  const data = useDocuments(tenantId, source, initialSearch)
  const yearIndex = data.years.indexOf(data.year)
  const previousYear = yearIndex >= 0 ? data.years[yearIndex + 1] : undefined
  const nextYear = yearIndex > 0 ? data.years[yearIndex - 1] : undefined
  const DocumentsView = data.viewMode === 'grid' ? AttendanceDocumentGrid : AttendanceDocumentList
  return (
    <div className="min-w-0 space-y-5">
      <FiltersPanel description="Pesquise e filtre os documentos">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <DocumentSearch value={data.search} onChange={data.setSearch} />
            <YearSelector
              years={data.years.length ? data.years : [data.year]}
              value={data.year}
              onChange={data.setYear}
              disabled={data.yearsLoading || Boolean(data.yearsError)}
            />
          </div>
          {data.yearsLoading && <p className="text-muted-foreground text-sm">Carregando anos...</p>}
          {data.yearsError && (
            <div role="alert" className="text-destructive text-sm">
              Não foi possível carregar os anos disponíveis.{' '}
              <Button variant="outline" onClick={data.reload}>
                Tentar novamente
              </Button>
            </div>
          )}
          <CardDescription>Realize a Navegação por Período</CardDescription>
          <MonthCarousel
            countByMonth={data.monthCounts}
            selectedMonth={data.month}
            onSelectMonth={data.toggleMonth}
            onPreviousYear={
              previousYear === undefined ? undefined : () => data.setYear(previousYear)
            }
            onNextYear={nextYear === undefined ? undefined : () => data.setYear(nextYear)}
          />
          {data.monthsLoading && (
            <p className="text-muted-foreground text-sm">Carregando períodos...</p>
          )}
          {data.monthsError && (
            <div role="alert" className="text-destructive text-sm">
              Não foi possível carregar as quantidades por mês.{' '}
              <Button variant="outline" onClick={data.reload}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>
      </FiltersPanel>
      <DataTableCard
        title="Documentos"
        count={data.totalItems}
        icon={
          <div role="group" aria-label="Apresentação dos documentos" className="flex gap-1">
            <Button
              type="button"
              variant={data.viewMode === 'grid' ? 'default' : 'outline'}
              size="icon-sm"
              aria-label="Visualização em blocos"
              title="Blocos"
              aria-pressed={data.viewMode === 'grid'}
              onClick={() => data.changeViewMode('grid')}
            >
              <LayoutGrid />
            </Button>
            <Button
              type="button"
              variant={data.viewMode === 'list' ? 'default' : 'outline'}
              size="icon-sm"
              aria-label="Visualização em lista"
              title="Lista"
              aria-pressed={data.viewMode === 'list'}
              onClick={() => data.changeViewMode('list')}
            >
              <List />
            </Button>
          </div>
        }
        isLoading={data.isLoading}
        loadingMessage="Carregando documentos..."
        isEmpty={Boolean(data.error) || !data.items.length}
        emptyState={
          data.error ? (
            <div
              role="alert"
              className="text-destructive flex min-h-48 flex-wrap items-center justify-center gap-2 border-t p-6 text-sm"
            >
              {data.error}{' '}
              <Button variant="outline" onClick={data.reload}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <EmptyTableState
              title="Nenhum documento encontrado."
              description="Não há documentos com os filtros selecionados."
            />
          )
        }
        footer={
          <div className="text-muted-foreground flex flex-col gap-3 border-t px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-medium">
              Página {data.page} de {data.totalPages} · {data.totalItems} registros
            </span>
            <Pagination
              currentPage={data.page}
              totalPages={data.totalPages}
              onPageChange={data.setPage}
            />
          </div>
        }
      >
        <div className={data.viewMode === 'grid' ? 'border-t p-4 sm:p-6' : undefined}>
          <DocumentsView
            documents={data.items}
            onViewPhoto={onViewPhoto}
            onViewPdf={onViewPdf}
            onDownloadPdf={data.viewMode === 'grid' ? onOpenPdf || onDownloadPdf : onDownloadPdf}
            isProcessing={isProcessing}
          />
        </div>
      </DataTableCard>
    </div>
  )
}
