import { Download, ExternalLink } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

export function PdfPreviewModal({ document, isProcessing, error, onDownload, onView, onClose }) {
  const open = Boolean(document)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
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

        {error && <p className="text-destructive text-sm font-medium">{error}</p>}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onView} disabled={isProcessing}>
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Abrir no navegador
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing}>
              Fechar
            </Button>
            <Button type="button" onClick={onDownload} disabled={isProcessing}>
              <Download className="mr-1.5 h-4 w-4" />
              {isProcessing ? 'Gerando...' : 'Baixar PDF'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
