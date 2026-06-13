import { SESSION_STATUS, USER_STATUS } from '@/lib/roles'
import { formatDateTime, getSessionStatusLabel, maskCpf } from '@/lib/userFormatters'
import { cn } from '@/lib/utils'
import { UserRoleBadge } from '@/components/users/UserRoleBadge'
import { UserStatusBadge } from '@/components/users/UserStatusBadge'

const columns = ['Nome Completo', 'CPF', 'Nível de Acesso', 'Status', 'Último Acesso']

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
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="bg-muted/40 border-y">
            {columns.map((column) => (
              <th
                key={column}
                className="text-foreground px-4 py-3 text-left text-xs font-semibold"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isInactive = user.status === USER_STATUS.INACTIVE
            const isSelected = selectedUserId === user.id
            const isSessionActive = user.sessionStatus === SESSION_STATUS.ACTIVE

            return (
              <tr
                key={user.id}
                className={cn(
                  'hover:bg-muted/50 cursor-pointer border-b transition-colors',
                  isInactive && 'bg-muted/20 text-muted-foreground opacity-70',
                  isSelected && 'bg-primary/10 hover:bg-primary/10'
                )}
                onClick={() => onSelectUser(user.id)}
              >
                <td className="px-4 py-3">
                  <div className="text-foreground font-semibold">{user.name}</div>
                  <div
                    className={cn(
                      'mt-1 flex items-center gap-1 text-xs',
                      isSessionActive ? 'text-emerald-600' : 'text-muted-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'size-1.5 rounded-full',
                        isSessionActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                      )}
                    />
                    {getSessionStatusLabel(user.sessionStatus)}
                  </div>
                </td>
                <td className="text-muted-foreground px-4 py-3 font-medium">{maskCpf(user.cpf)}</td>
                <td className="px-4 py-3">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <UserStatusBadge status={user.status} />
                </td>
                <td className="text-muted-foreground px-4 py-3">
                  {formatDateTime(user.lastAccessAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
