import { getActiveStatusLabel } from '@/lib/userFormatters'
import { cn } from '@/lib/utils'

const statusClasses = {
  active: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  inactive: 'bg-gray-100 text-gray-500 ring-gray-200',
}

export function UserStatusBadge({ isActive }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1',
        statusClasses[isActive ? 'active' : 'inactive']
      )}
    >
      {getActiveStatusLabel(isActive)}
    </span>
  )
}
