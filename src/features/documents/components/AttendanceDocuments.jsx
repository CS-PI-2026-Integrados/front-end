import { Image, Download } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { AttendanceHistoryTable } from '@/features/attendance'
import { DocumentGrid } from './DocumentGrid'

function AttendanceActions({ document, onViewPhoto, onDownloadPdf }) {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex-1"
        disabled={!onViewPhoto}
        onClick={() => onViewPhoto?.(document)}
      >
        <Image className="mr-1.5 h-3.5 w-3.5" />
        Foto
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="flex-1"
        disabled={!onDownloadPdf}
        onClick={() => onDownloadPdf?.(document)}
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        PDF
      </Button>
    </div>
  )
}

export function AttendanceDocumentGrid({ documents, onViewPhoto, onDownloadPdf }) {
  return (
    <DocumentGrid
      documents={documents}
      renderActions={(document) => (
        <AttendanceActions
          document={document}
          onViewPhoto={onViewPhoto}
          onDownloadPdf={onDownloadPdf}
        />
      )}
    />
  )
}

export function AttendanceDocumentList({
  documents,
  onViewPdf,
  onViewPhoto,
  onDownloadPdf,
  isProcessing,
}) {
  return (
    <AttendanceHistoryTable
      records={documents}
      onViewPdf={onViewPdf}
      onViewPhoto={onViewPhoto}
      onDownloadPdf={onDownloadPdf}
      isProcessing={isProcessing}
    />
  )
}
