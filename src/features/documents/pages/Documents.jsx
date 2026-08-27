import { Calendar, FileText, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { useSession } from '@/features/authentication/context/sessionContext'
import { useDocuments } from '../hooks/useDocuments'
import { YearSelector } from '../components/YearSelector'
import { MonthCarousel } from '../components/MonthCarousel'
import { DocumentSearch } from '../components/DocumentSearch'
import { DocumentGrid } from '../components/DocumentGrid'
import { DocumentList } from '../components/DocumentList'

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

const Documents = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id

  const {
    activeTab,
    setActiveTab,
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
    getProcessNumber,
  } = useDocuments(tenantId)

  const periodLabel = `${MONTHS_LONG[selectedMonth]} ${selectedYear}`

  const counterLabel = hasSearch
    ? `${filteredDocuments.length} de ${monthDocuments.length} documento(s) encontrado(s)`
    : `${monthDocuments.length} documento(s) encontrado(s)`

  const emptyLabel = hasSearch
    ? `Nenhum documento encontrado para "${search}" em ${periodLabel}.`
    : 'Nenhum documento neste período'

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Arquivo de Documentos"
        description="Repositório centralizado de comprovantes e documentos"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="attendance">Atendimentos</TabsTrigger>
          <TabsTrigger value="groups">Grupos Reflexivos</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-6">
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
              ) : viewMode === 'grid' ? (
                <DocumentGrid documents={filteredDocuments} getProcessNumber={getProcessNumber} />
              ) : (
                <DocumentList documents={filteredDocuments} getProcessNumber={getProcessNumber} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups">
          <Card>
            <CardContent className="text-muted-foreground p-6 text-sm">
              Em desenvolvimento
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Documents
