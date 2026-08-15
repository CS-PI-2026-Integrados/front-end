import { useCallback, useEffect, useRef, useState } from 'react'
import { CalendarDays, Clock3, KeyRound, Mail, Power, RotateCcw, IdCard, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  canDeactivateUser,
  canReactivateUser,
  canResetUserPassword,
} from '@/features/usuarios/utils/userPermissionsUtils'
import {
  formatDate,
  formatDateTime,
  maskCpf,
  maskEmail,
} from '@/features/usuarios/utils/userFormattersUtils'
import { UserActionConfirmDialog } from '@/features/usuarios/components/users/UserActionConfirmDialog'
import { ResetUserPasswordDialog } from '@/features/usuarios/components/users/ResetUserPasswordDialog'
import { UserRoleBadge } from '@/features/usuarios/components/users/UserRoleBadge'
import { UserStatusBadge } from '@/features/usuarios/components/users/UserStatusBadge'
import { cn } from '@/shared/lib/utils'

const PANEL_ANIMATION_MS = 200

export function UserDetailsPanel({
  currentUser,
  onClose,
  onDeactivate,
  onReactivate,
  onResetPassword,
  user,
}) {
  const [pendingAction, setPendingAction] = useState(null)
  const [isClosing, setIsClosing] = useState(false)
  const closeTimeoutRef = useRef(null)

  const requestClose = useCallback(() => {
    if (isClosing) return

    setPendingAction(null)
    setIsClosing(true)

    closeTimeoutRef.current = window.setTimeout(() => {
      onClose()
      setIsClosing(false)
      closeTimeoutRef.current = null
    }, PANEL_ANIMATION_MS)
  }, [isClosing, onClose])

  useEffect(() => {
    if (!user) return

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        requestClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [requestClose, user])

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  if (!user) return null

  const actions = [
    {
      key: 'reset-password',
      label: 'Redefinir senha',
      icon: KeyRound,
      visible: canResetUserPassword(currentUser, user),
    },
    {
      key: 'deactivate',
      label: 'Desativar usuário',
      icon: Power,
      visible: canDeactivateUser(currentUser, user),
      destructive: true,
      title: 'Desativar usuário',
      description: `Desativar o acesso de ${user.name}, CPF ${maskCpf(user.cpf)}? O acesso será bloqueado.`,
      onConfirm: () => onDeactivate(user),
    },
    {
      key: 'reactivate',
      label: 'Reativar usuário',
      icon: RotateCcw,
      visible: canReactivateUser(currentUser, user),
      title: 'Reativar usuário',
      description: `Restaurar o acesso de ${user.name}?`,
      onConfirm: () => onReactivate(user),
    },
  ].filter((action) => action.visible)

  const selectedAction =
    pendingAction?.userId === user.id
      ? actions.find((action) => action.key === pendingAction.key)
      : null

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 duration-200',
          isClosing ? 'animate-out fade-out-0' : 'animate-in fade-in-0'
        )}
        onClick={requestClose}
      >
        <aside
          className={cn(
            'bg-background ring-border ml-auto flex h-full w-full max-w-sm flex-col shadow-xl ring-1 duration-200',
            isClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right'
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-start justify-between gap-4 border-b p-5">
            <div>
              <h2 className="text-base font-semibold">{user.name}</h2>
              <p className="text-muted-foreground mt-1 text-sm">Detalhes do usuário da comarca</p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={requestClose}>
              <X />
              <span className="sr-only">Fechar painel</span>
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="flex flex-wrap gap-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge isActive={user.isActive} />
            </div>

            <div className="mt-6 space-y-5 border-t pt-5">
              <DetailItem icon={IdCard} label="CPF" value={maskCpf(user.cpf)} />
              <DetailItem icon={Mail} label="E-mail de recuperação" value={maskEmail(user.email)} />
              <DetailItem
                icon={CalendarDays}
                label="Cadastrado em"
                value={formatDate(user.createdAt)}
              />
              <DetailItem
                icon={Clock3}
                label="Último acesso"
                value={formatDateTime(user.lastAccessAt)}
              />
            </div>

            <div className="mt-6 border-t pt-5">
              <h3 className="text-sm font-semibold">Ações</h3>
              <div className="mt-3 space-y-2">
                {actions.length > 0 ? (
                  actions.map((action) => {
                    const Icon = action.icon

                    return (
                      <Button
                        key={action.key}
                        variant={action.destructive ? 'destructive' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setPendingAction({ key: action.key, userId: user.id })}
                      >
                        <Icon />
                        {action.label}
                      </Button>
                    )
                  })
                ) : (
                  <p className="bg-muted/30 text-muted-foreground rounded-md border p-3 text-sm">
                    Nenhuma ação disponível para este usuário.
                  </p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {selectedAction?.key === 'reset-password' && (
        <ResetUserPasswordDialog
          onConfirm={() => onResetPassword(user)}
          onOpenChange={(open) => {
            if (!open) setPendingAction(null)
          }}
          open
          user={user}
        />
      )}

      {selectedAction && selectedAction.key !== 'reset-password' && (
        <UserActionConfirmDialog
          actionLabel={selectedAction.label}
          description={selectedAction.description}
          isDestructive={selectedAction.destructive}
          onConfirm={selectedAction.onConfirm}
          onOpenChange={(open) => {
            if (!open) setPendingAction(null)
          }}
          open={Boolean(selectedAction)}
          title={selectedAction.title}
        />
      )}
    </>
  )
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="text-muted-foreground mt-0.5 size-4" />
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="mt-0.5 text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
