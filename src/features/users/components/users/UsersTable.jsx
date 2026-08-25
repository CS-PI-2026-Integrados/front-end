import { formatDateTime, maskCpf, maskEmail } from '@/features/users/utils/userFormattersUtils'
import { cn } from '@/shared/lib/utils'
import { UserRoleBadge } from '@/features/users/components/users/UserRoleBadge'
import { UserStatusBadge } from '@/features/users/components/users/UserStatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

const columns = ['Nome Completo', 'CPF', 'E-mail', 'Nível de Acesso', 'Status', 'Último Acesso']

export function UsersTable({ users, selectedUserId, onSelectUser }) {
  if (users.length === 0) {
    return (
      <div className="text-muted-foreground flex min-h-48 items-center justify-center border-t text-sm">
        Nenhum usuário encontrado.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-205 text-sm">
        <TableHeader>
          <TableRow className="bg-secondary border-y">
            {columns.map((column) => (
              <TableHead key={column} className="px-4 py-3 text-left text-xs font-semibold">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isInactive = !user.isActive
            const isSelected = selectedUserId === user.id

            return (
              <TableRow
                key={user.id}
                className={cn(
                  'hover:bg-muted/50 cursor-pointer border-b transition-colors',
                  isInactive && 'bg-muted/20 text-muted-foreground opacity-70',
                  isSelected && 'bg-primary/10 hover:bg-primary/10'
                )}
                onClick={() => onSelectUser(user.id)}
              >
                <TableCell className="px-4 py-3">
                  <div className="text-foreground font-semibold">{user.name}</div>
                </TableCell>
                <TableCell className="text-muted-foreground px-4 py-3 font-medium">
                  {maskCpf(user.cpf)}
                </TableCell>
                <TableCell className="text-muted-foreground px-4 py-3 font-medium">
                  {maskEmail(user.email)}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <UserStatusBadge isActive={user.isActive} />
                </TableCell>
                <TableCell className="text-muted-foreground px-4 py-3">
                  {formatDateTime(user.lastAccessAt)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
