import { Download, ExternalLink } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { useReceiptPdfActions } from '@/features/attendance'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

export function PdfPreviewModal({ document, payload, onClose }) {
  const open = Boolean(document)
  const { download, view } = useReceiptPdfActions()

  function handleDownload() {
    if (!payload) return
    download(payload)
    onClose?.({ downloaded: true })
  }

  function handleView() {
    if (!payload) return
    view(payload)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose?.()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Pré-visualização do comprovante</DialogTitle>
        </DialogHeader>

        <div className="bg-muted/40 space-y-2 rounded-lg border p-4 text-sm">
          <p>
            <span className="text-muted-foreground">Apenado:</span>{' '}
            <span className="font-medium">{document?.convictedName}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Processo:</span>{' '}
            <span className="font-medium">{document?.processNumber}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Data e hora:</span>{' '}
            <span className="font-medium">{document ? formatDateTime(document.issuedAt) : ''}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Operador:</span>{' '}
            <span className="font-medium">{document?.operatorName || '—'}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Código de verificação:</span>{' '}
            <span className="font-mono text-xs">{document?.verificationCode}</span>
          </p>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={handleView} disabled={!payload}>
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Abrir no navegador
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onClose?.()}>
              Fechar
            </Button>
            <Button type="button" onClick={handleDownload} disabled={!payload}>
              <Download className="mr-1.5 h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
