import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

export function UserActionConfirmDialog({
  actionLabel,
  confirmLabel,
  description,
  isDestructive = false,
  onConfirm,
  onOpenChange,
  open,
  title,
}) {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      destructive={isDestructive}
      confirmLabel={confirmLabel || actionLabel}
      onConfirm={onConfirm}
    />
  )
}
