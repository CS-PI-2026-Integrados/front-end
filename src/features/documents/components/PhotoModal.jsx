import { ImageOff } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'

export function PhotoModal({ document, onClose }) {
  const open = Boolean(document)
  const hasPhoto = Boolean(document?.photoUrl)

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{document?.convictedName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {hasPhoto ? (
            <img
              src={document.photoUrl}
              alt={`Foto do atendimento de ${document.convictedName}`}
              className="max-h-96 w-full rounded-lg object-contain"
            />
          ) : (
            <div className="bg-muted flex h-64 w-full flex-col items-center justify-center gap-2 rounded-lg">
              <ImageOff className="text-muted-foreground/40 h-12 w-12" />
              <p className="text-muted-foreground text-sm font-medium">
                Foto não disponível para este atendimento.
              </p>
            </div>
          )}

          <div className="text-muted-foreground w-full space-y-1 text-sm">
            <p>
              <span className="text-foreground font-medium">Processo:</span>{' '}
              {document?.processNumber}
            </p>
            <p>
              <span className="text-foreground font-medium">Data e hora:</span>{' '}
              {document ? formatDateTime(document.issuedAt) : ''}
            </p>
            <p>
              <span className="text-foreground font-medium">Operador:</span>{' '}
              {document?.operatorName || '—'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
