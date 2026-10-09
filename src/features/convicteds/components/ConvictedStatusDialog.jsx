import { useConvictedStatus } from '../hooks/useConvictedStatus'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

export function ConvictedStatusDialog({ convicted, open, onOpenChange, onSuccess }) {
  const { updateStatus, isSaving, error } = useConvictedStatus()
  const activating = convicted?.status === 'INACTIVE'
  const action = activating ? 'Ativar' : 'Inativar'
  const name = convicted?.fullName || convicted?.name || 'o apenado'

  const handleConfirm = async () => {
    const updated = await updateStatus(convicted?.id, activating ? 'ACTIVE' : 'INACTIVE')
    if (!updated) return !activating
    onSuccess?.(updated)
    return true
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`${action} apenado`}
      description={
        activating ? (
          <>
            Deseja ativar <strong>{name}</strong>? O cadastro voltará a permitir alterações de
            dados, processos e foto.
          </>
        ) : (
          <>
            Deseja inativar <strong>{name}</strong>? O registro será mantido para auditoria, mas o
            status será alterado para Inativo.
          </>
        )
      }
      destructive={!activating}
      confirmLabel={isSaving ? (activating ? 'Ativando...' : 'Inativando...') : action}
      onConfirm={handleConfirm}
      isConfirming={isSaving}
      error={activating ? error : null}
    />
  )
}
