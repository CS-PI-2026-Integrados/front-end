import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

export function ApenadoDeactivateDialog({ apenado, onConfirm, onOpenChange }) {
  const open = Boolean(apenado)

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Inativar apenado"
      description={
        <>
          Deseja inativar <strong>{apenado?.nomeCompleto}</strong>? O status será alterado para
          Inativo.
        </>
      }
      destructive
      confirmLabel="Inativar"
      onConfirm={onConfirm}
    />
  )
}
