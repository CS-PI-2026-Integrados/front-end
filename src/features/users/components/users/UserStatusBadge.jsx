import { getActiveStatusLabel } from '@/features/users/utils/userFormattersUtils'
import { cn } from '@/shared/lib/utils'

const statusClasses = {
  active:
    'bg-emerald-100 text-emerald-600 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800',
  inactive:
    'bg-gray-200 text-gray-600 ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600',
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
