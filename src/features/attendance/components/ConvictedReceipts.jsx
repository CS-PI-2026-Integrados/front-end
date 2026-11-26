import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useSession } from '@/features/authentication'
import { DataTableCard, DataTablePagination } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { Button } from '@/shared/components/ui/button'
import { useAttendanceList } from '../hooks/useAttendanceList'
import { useAttendancePhoto } from '../hooks/useAttendancePhoto'
import { useReceiptPdfActions } from '../hooks/useReceiptPdfActions'
import { AttendanceHistoryTable } from './AttendanceHistoryTable'
import { AttendancePhotoDialog } from './AttendancePhotoDialog'

function ReceiptHistory({ convictedId, convictedName, maskedCpf }) {
  const [page, setPage] = useState(1)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [activePdf, setActivePdf] = useState(null)
  const photoTrigger = useRef(null)
  const section = useRef(null)
  const { hash } = useLocation()
  const data = useAttendanceList({ convictedId, page })
  const photo = useAttendancePhoto(selectedPhoto?.id)
  const pdf = useReceiptPdfActions()
  const records = data.items.map((record) => ({
    ...record,
    convictedName,
    convictedCpf: maskedCpf,
  }))

  useEffect(() => {
    if (hash === '#comprovantes') {
      section.current?.scrollIntoView({ block: 'start' })
      section.current?.focus({ preventScroll: true })
    }
  }, [hash])

  function requestPdf(record, action) {
    setActivePdf({ recordId: record.id, action })
    void pdf[action](record)
  }

  return (
    <section
      id="comprovantes"
      ref={section}
      aria-label="Comprovantes"
      tabIndex={-1}
      className="min-w-0 scroll-mt-4"
    >
      {data.refreshError && (
        <p role="alert" className="text-destructive mb-3 flex flex-wrap items-center gap-2 text-sm">
          {data.refreshError}
          <Button type="button" variant="outline" size="sm" onClick={data.reload}>
            Tentar novamente
          </Button>
        </p>
      )}
      <DataTableCard
        title="Comprovantes"
        count={data.totalItems}
        isLoading={data.isLoading}
        loadingMessage="Carregando comprovantes…"
        isEmpty={Boolean(data.error) || !records.length}
        emptyState={
          data.error ? (
            <div
              role="alert"
              className="text-destructive flex min-h-48 flex-wrap items-center justify-center gap-2 border-t p-6 text-sm"
            >
              Não foi possível carregar os comprovantes.
              <Button type="button" size="sm" variant="outline" onClick={data.reload}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <EmptyTableState title="Nenhuma presença registrada." />
          )
        }
        footer={
          <DataTablePagination
            currentPage={page}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            onPageChange={(next) => {
              if (next === page) return
              section.current?.focus()
              setPage(next)
            }}
          />
        }
      >
        <AttendanceHistoryTable
          compact
          records={records}
          isProcessing={pdf.isProcessing}
          pdfFeedback={activePdf ? { ...activePdf, error: pdf.error } : null}
          onViewPdf={(record) => requestPdf(record, 'view')}
          onDownloadPdf={(record) => requestPdf(record, 'download')}
          onViewPhoto={(record, trigger) => {
            photoTrigger.current = trigger
            setSelectedPhoto(record)
          }}
        />
      </DataTableCard>
      <AttendancePhotoDialog
        document={selectedPhoto ? { ...selectedPhoto, photoUrl: photo.url } : null}
        isLoading={photo.isLoading}
        error={photo.error}
        onRetry={photo.retry}
        onClose={() => setSelectedPhoto(null)}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const target = photoTrigger.current?.isConnected ? photoTrigger.current : section.current
          target?.focus()
        }}
      />
    </section>
  )
}

export function ConvictedReceipts({ convictedId, convictedName, maskedCpf }) {
  const { session } = useSession()
  const key = JSON.stringify([session?.user?.id, session?.tenant?.id, convictedId])
  if (!convictedId) return null
  return (
    <ReceiptHistory
      key={key}
      convictedId={convictedId}
      convictedName={convictedName}
      maskedCpf={maskedCpf}
    />
  )
}
