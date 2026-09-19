import { Image, Download } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { Button } from '@/shared/components/ui/button'
import { TableCell } from '@/shared/components/ui/table'
import { DocumentGrid } from './DocumentGrid'
import { DocumentList } from './DocumentList'

const LIST_COLUMNS = ['Nome', 'Processo', 'Data/Hora', 'Operador', 'Ações']

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

export function AttendanceDocumentList({ documents, onViewPhoto, onDownloadPdf }) {
  return (
    <DocumentList
      columns={LIST_COLUMNS}
      documents={documents}
      renderRow={(document) => (
        <>
          <TableCell className="font-medium">{document.convictedName}</TableCell>
          <TableCell>{document.processNumber}</TableCell>
          <TableCell>{formatDateTime(document.issuedAt)}</TableCell>
          <TableCell>{document.operatorName || '—'}</TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Ver foto"
                disabled={!onViewPhoto}
                onClick={() => onViewPhoto?.(document)}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Baixar PDF"
                disabled={!onDownloadPdf}
                onClick={() => onDownloadPdf?.(document)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </>
      )}
    />
  )
}
