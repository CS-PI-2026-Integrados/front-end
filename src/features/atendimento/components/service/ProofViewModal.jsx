import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/dialog.jsx'

export function ProofViewModal({ open, onOpenChange, comprovante }) {
  if (!comprovante) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Visualizar Comprovante</DialogTitle>
          <DialogDescription>Detalhes do comprovante de presença gerado.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-muted flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border p-1">
            {comprovante.photoUrl ? (
              <img
                src={comprovante.photoUrl}
                alt="Foto do Atendimento"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <div className="bg-muted-foreground/20 h-full w-full rounded-full" />
            )}
          </div>
          <div className="w-full space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Apenado</span>
              <span className="text-right font-medium">{comprovante.nomeApenado}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">CPF</span>
              <span className="font-medium">{comprovante.cpf}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Data/Hora</span>
              <span className="font-medium">
                {new Date(comprovante.emitidoEm).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Operador</span>
              <span className="text-right font-medium">{comprovante.nomeOperador}</span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Cód. Validação</span>
              <span className="text-right font-mono text-xs font-medium">
                {comprovante.codigoVerificacao}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
