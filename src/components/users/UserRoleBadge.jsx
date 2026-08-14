import { getRoleLabel } from '@/features/usuarios/model/userFormatters'
import { cn } from '@/shared/lib/utils'

const roleClasses = {
  admin:
    'bg-purple-100 text-purple-700 ring-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:ring-purple-800',
  operator:
    'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-800',
}

export function UserRoleBadge({ role }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1',
        roleClasses[role?.key] || 'bg-muted text-muted-foreground ring-border dark:bg-muted/50'
      )}
    >
      {getRoleLabel(role)}
    </span>
  )
}
