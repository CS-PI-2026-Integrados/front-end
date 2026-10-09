import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Pagination } from '@/shared/components/ui/pagination'
import { useAttendanceList } from '../hooks/useAttendanceList'
import { useReceiptPdfActions } from '../hooks/useReceiptPdfActions'
import { useAttendancePhoto } from '../hooks/useAttendancePhoto'
import { AttendanceHistoryTable } from './AttendanceHistoryTable'
import { AttendancePhotoDialog } from './AttendancePhotoDialog'

export function ProofHistory() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const photo = useAttendancePhoto(selectedPhoto?.id)
  const data = useAttendanceList({ page, search })
  const pdf = useReceiptPdfActions()
  return (
    <div className="space-y-4">
      <FiltersPanel description="Pesquise os comprovantes emitidos">
        <div className="relative min-w-0 flex-1">
          <Search
            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden="true"
          />
          <Input
            aria-label="Buscar comprovantes"
            placeholder="Buscar por nome, CPF ou processo"
            value={search}
            className="pl-9"
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
          />
        </div>
      </FiltersPanel>
      {data.error && (
        <p role="alert" className="text-destructive flex flex-wrap items-center gap-2 text-sm">
          {data.error}
          <Button type="button" variant="outline" size="sm" onClick={data.reload}>
            Tentar novamente
          </Button>
        </p>
      )}
      {pdf.error && (
        <p role="alert" className="text-destructive">
          {pdf.error}
        </p>
      )}
      <DataTableCard
        title="Histórico de Comprovantes Emitidos"
        count={data.totalItems}
        icon={<FileText className="text-muted-foreground size-5" aria-hidden="true" />}
        isLoading={data.isLoading}
        loadingMessage="Carregando comprovantes..."
        isEmpty={Boolean(data.error) || !data.items.length}
        emptyState={
          <EmptyTableState
            icon={FileText}
            title={data.error ? 'Histórico indisponível' : 'Nenhum comprovante encontrado'}
            description={
              data.error
                ? 'Tente carregar o histórico novamente.'
                : search
                  ? `Não há resultados para "${search}". Tente outro termo.`
                  : 'Os atendimentos registrados aparecerão aqui.'
            }
          />
        }
        footer={
          <div className="text-muted-foreground flex flex-col gap-3 border-t px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-medium">
              Página {page} de {data.totalPages} · {data.totalItems} registros
            </span>
            <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
          </div>
        }
      >
        <AttendanceHistoryTable
          records={data.items}
          onViewPdf={pdf.view}
          onViewPhoto={setSelectedPhoto}
          onDownloadPdf={pdf.download}
          isProcessing={pdf.isProcessing}
        />
      </DataTableCard>
      <AttendancePhotoDialog
        document={selectedPhoto ? { ...selectedPhoto, photoUrl: photo.url } : null}
        isLoading={photo.isLoading}
        error={photo.error}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  )
}
