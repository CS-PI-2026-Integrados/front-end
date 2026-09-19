import { Download } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { Button } from '@/shared/components/ui/button'
import { TableCell } from '@/shared/components/ui/table'
import { DocumentGrid } from './DocumentGrid'
import { DocumentList } from './DocumentList'
import { GroupDocumentTypeBadge } from './GroupDocumentTypeBadge'

const LIST_COLUMNS = ['Nome', 'Processo', 'Grupo', 'Tipo do Documento', 'Data de Geração', 'Ação']

function GroupNameButton({ document, onOpenGroup, className }) {
  return (
    <button type="button" onClick={() => onOpenGroup(document.groupId)} className={className}>
      {document.groupName}
    </button>
  )
}

export function GroupDocumentGrid({ documents, onOpenGroup, onDownloadPdf }) {
  return (
    <DocumentGrid
      documents={documents}
      renderMeta={(document) => (
        <GroupNameButton
          document={document}
          onOpenGroup={onOpenGroup}
          className="text-primary mt-0.5 block truncate text-xs font-medium hover:underline"
        />
      )}
      renderActions={(document) => (
        <div className="space-y-3">
          <GroupDocumentTypeBadge type={document.type} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!onDownloadPdf}
            onClick={() => onDownloadPdf?.(document)}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            PDF
          </Button>
        </div>
      )}
    />
  )
}

export function GroupDocumentList({ documents, onOpenGroup, onDownloadPdf }) {
  return (
    <DocumentList
      columns={LIST_COLUMNS}
      documents={documents}
      renderRow={(document) => (
        <>
          <TableCell className="font-medium">{document.convictedName}</TableCell>
          <TableCell>{document.processNumber}</TableCell>
          <TableCell>
            <GroupNameButton
              document={document}
              onOpenGroup={onOpenGroup}
              className="text-primary font-medium hover:underline"
            />
          </TableCell>
          <TableCell>
            <GroupDocumentTypeBadge type={document.type} />
          </TableCell>
          <TableCell>{formatDateTime(document.issuedAt)}</TableCell>
          <TableCell>
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
          </TableCell>
        </>
      )}
    />
  )
}
