import { Calendar, FileText, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { useDocuments } from '../hooks/useDocuments'
import { YearSelector } from './YearSelector'
import { MonthCarousel } from './MonthCarousel'
import { DocumentSearch } from './DocumentSearch'
import { AttendanceDocumentGrid, AttendanceDocumentList } from './AttendanceDocuments'
import { GroupDocumentGrid, GroupDocumentList } from './GroupDocuments'

const MONTHS_LONG = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function DocumentArchive({ tenantId, source, onOpenGroup, onViewPhoto, onDownloadPdf }) {
  const {
    search,
    setSearch,
    hasSearch,
    selectedYear,
    selectYear,
    availableYears,
    selectedMonth,
    selectMonth,
    countByMonth,
    viewMode,
    changeViewMode,
    monthDocuments,
    filteredDocuments,
  } = useDocuments(tenantId, source)

  const isGroup = source === 'group'
  const periodLabel = `${MONTHS_LONG[selectedMonth]} ${selectedYear}`

  const counterLabel = hasSearch
    ? `${filteredDocuments.length} de ${monthDocuments.length} documento(s) encontrado(s)`
    : `${monthDocuments.length} documento(s) encontrado(s)`

  const emptyLabel = hasSearch
    ? `Nenhum documento encontrado para "${search}" em ${periodLabel}.`
    : 'Nenhum documento neste período'

  function renderDocuments() {
    if (isGroup) {
      return viewMode === 'grid' ? (
        <GroupDocumentGrid
          documents={filteredDocuments}
          onOpenGroup={onOpenGroup}
          onDownloadPdf={onDownloadPdf}
        />
      ) : (
        <GroupDocumentList
          documents={filteredDocuments}
          onOpenGroup={onOpenGroup}
          onDownloadPdf={onDownloadPdf}
        />
      )
    }

    return viewMode === 'grid' ? (
      <AttendanceDocumentGrid
        documents={filteredDocuments}
        onViewPhoto={onViewPhoto}
        onDownloadPdf={onDownloadPdf}
      />
    ) : (
      <AttendanceDocumentList
        documents={filteredDocuments}
        onViewPhoto={onViewPhoto}
        onDownloadPdf={onDownloadPdf}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="text-muted-foreground h-5 w-5" />
              <h2 className="font-semibold">Navegação por Período</h2>
            </div>
            <YearSelector years={availableYears} value={selectedYear} onChange={selectYear} />
          </div>

          <MonthCarousel
            countByMonth={countByMonth}
            selectedMonth={selectedMonth}
            onSelectMonth={selectMonth}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{periodLabel}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">{counterLabel}</p>
            </div>

            <div className="flex items-center gap-3">
              <DocumentSearch value={search} onChange={setSearch} />

              <div className="flex items-center gap-1 rounded-lg border p-1">
                <Button
                  type="button"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  aria-label="Visualização em grade"
                  onClick={() => changeViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  aria-label="Visualização em lista"
                  onClick={() => changeViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12">
              <FileText className="text-muted-foreground/40 h-10 w-10" />
              <p className="mt-3 text-sm font-medium">{emptyLabel}</p>
            </div>
          ) : (
            renderDocuments()
          )}
        </CardContent>
      </Card>
    </div>
  )
}
