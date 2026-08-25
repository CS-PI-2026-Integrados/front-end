import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'

export function ApenadoDeactivateDialog({ apenado, onConfirm, onOpenChange }) {
  const open = Boolean(apenado)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Inativar apenado</DialogTitle>
          <DialogDescription>
            Deseja inativar <strong>{apenado?.nomeCompleto}</strong>? O status será alterado para
            Inativo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Inativar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
