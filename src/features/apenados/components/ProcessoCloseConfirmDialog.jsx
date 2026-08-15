import { AlertTriangle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'

export function ProcessoCloseConfirmDialog({ open, onConfirm, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <AlertTriangle className="size-5" />
            </span>
            Atenção
          </DialogTitle>
          <DialogDescription>
            Este é o único processo ativo. Ao encerrá-lo, o apenado será dado como inativo no
            sistema. Deseja continuar?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Encerrar mesmo assim
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
