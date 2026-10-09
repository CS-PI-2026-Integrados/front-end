import { CircleMinus, CirclePlus, KeyRound } from 'lucide-react'
import {
  formatDate,
  getActiveStatusLabel,
  getRoleLabel,
  maskCpf,
  maskEmail,
} from '@/features/users/utils/userFormattersUtils'
import {
  canDeactivateUser,
  canReactivateUser,
  canResetUserPassword,
} from '@/features/users/utils/userPermissionsUtils'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export function UsersTable({ users, currentUser, onAction, isSaving = false }) {
  return (
    <Table contentColumns="fit-content(28ch) max-content fit-content(32ch) max-content max-content max-content max-content">
      <TableHeader>
        <TableRow className="bg-secondary border-y">
          {['Nome completo', 'CPF', 'E-mail', 'Nível de acesso', 'Status', 'Data de criação'].map(
            (column) => (
              <TableHead
                key={column}
                className="text-foreground px-4 py-3 text-left text-xs font-semibold"
              >
                {column}
              </TableHead>
            )
          )}
          <TableHead className="text-foreground px-4 py-3 text-right text-xs font-semibold">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow
            key={user.id}
            className={cn(
              'hover:bg-muted/50 border-b transition-colors',
              !user.isActive &&
                'bg-muted/50 [&>td:not(:last-child)]:opacity-60 [&>td:not(:last-child)]:grayscale'
            )}
          >
            <TableCell
              className="min-w-40 px-4 py-3.5 font-semibold wrap-anywhere whitespace-normal"
              title={user.name}
            >
              {user.name}
            </TableCell>
            <TableCell className="text-muted-foreground px-4 py-3.5">{maskCpf(user.cpf)}</TableCell>
            <TableCell className="text-muted-foreground min-w-44 px-4 py-3.5 wrap-anywhere whitespace-normal">
              {maskEmail(user.email)}
            </TableCell>
            <TableCell className="px-4 py-3.5">{getRoleLabel(user.role)}</TableCell>
            <TableCell className="px-4 py-3.5">{getActiveStatusLabel(user.isActive)}</TableCell>
            <TableCell className="text-muted-foreground px-4 py-3.5">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell className="px-4 py-3.5 text-right">
              <div className="flex items-center justify-end gap-1">
                {canResetUserPassword(currentUser, user) && (
                  <Button
                    type="button"
                    title="Redefinir senha"
                    aria-label={`Redefinir senha de ${user.name}`}
                    variant="ghost"
                    size="icon-sm"
                    disabled={isSaving}
                    onClick={() => onAction('reset-password', user)}
                  >
                    <KeyRound aria-hidden="true" />
                  </Button>
                )}
                {canDeactivateUser(currentUser, user) && (
                  <Button
                    type="button"
                    title="Desativar usuário"
                    aria-label={`Desativar ${user.name}`}
                    variant="ghost"
                    size="icon-sm"
                    disabled={isSaving}
                    onClick={() => onAction('deactivate', user)}
                  >
                    <CircleMinus className="text-destructive" aria-hidden="true" />
                  </Button>
                )}
                {canReactivateUser(currentUser, user) && (
                  <Button
                    type="button"
                    title="Reativar usuário"
                    aria-label={`Reativar ${user.name}`}
                    variant="ghost"
                    size="icon-sm"
                    disabled={isSaving}
                    onClick={() => onAction('reactivate', user)}
                  >
                    <CirclePlus aria-hidden="true" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
