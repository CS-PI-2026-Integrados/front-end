import { useState } from 'react'
import { toast } from 'sonner'
import { convictedService } from '@/features/convicteds/services/convictedService'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

export function ConvictedDeactivateDialog({ apenado, convicted, open, onOpenChange, onSuccess }) {
  const target = convicted || apenado
  const isOpen = open !== undefined ? open : Boolean(target)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!target?.id) return

    setIsDeleting(true)
    try {
      await convictedService.deactivate(target.id)
      toast.success('Apenado inativado com sucesso!')
      onSuccess?.(target)
      onOpenChange?.(false)
    } catch (err) {
      toast.error(err?.message || 'Erro ao inativar o apenado.')
    } finally {
      setIsDeleting(false)
    }
  }

  const name = target?.name || target?.fullName || target?.nomeCompleto || 'o apenado'

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Inativar apenado"
      description={
        <>
          Deseja inativar <strong>{name}</strong>? O registro será mantido para auditoria, mas o
          status será alterado para Inativo.
        </>
      }
      destructive
      confirmLabel={isDeleting ? 'Inativando...' : 'Inativar'}
      onConfirm={handleConfirm}
      disabled={isDeleting}
    />
  )
}

export const ApenadoDeactivateDialog = ConvictedDeactivateDialog
