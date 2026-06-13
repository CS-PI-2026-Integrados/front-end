import { USER_STATUS } from '@/lib/roles'
import { getStatusLabel } from '@/lib/userFormatters'
import { cn } from '@/lib/utils'

const statusClasses = {
  [USER_STATUS.ACTIVE]: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  [USER_STATUS.INACTIVE]: 'bg-gray-100 text-gray-500 ring-gray-200',
}

export function UserStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1',
        statusClasses[status] || 'bg-muted text-muted-foreground ring-border'
      )}
    >
      {getStatusLabel(status)}
    </span>
  )
}
