import { USER_ROLES } from '@/lib/roles'
import { getRoleLabel } from '@/lib/userFormatters'
import { cn } from '@/lib/utils'

const roleClasses = {
  [USER_ROLES.OWNER]: 'bg-amber-100 text-amber-700 ring-amber-200',
  [USER_ROLES.ADMIN]: 'bg-purple-100 text-purple-700 ring-purple-200',
  [USER_ROLES.OPERATOR]: 'bg-blue-100 text-blue-700 ring-blue-200',
}

export function UserRoleBadge({ role }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1',
        roleClasses[role] || 'bg-muted text-muted-foreground ring-border'
      )}
    >
      {getRoleLabel(role)}
    </span>
  )
}
