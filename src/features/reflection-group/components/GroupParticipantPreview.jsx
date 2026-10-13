import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/shared/components/ui/avatar'
import { getInitials } from '@/shared/lib/getInitials'

const colors = [
  'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
]

export function GroupParticipantPreview({ participants, total }) {
  if (total === 0)
    return <span className="text-muted-foreground text-xs font-normal">Sem participantes</span>
  if (!participants)
    return <span className="text-muted-foreground text-xs font-normal">Iniciais indisponíveis</span>

  const visible = participants.slice(0, 3)
  const remaining = Math.max(0, total - visible.length)
  return (
    <AvatarGroup
      aria-label={`Prévia de ${total} ${total === 1 ? 'participante' : 'participantes'}`}
    >
      {visible.map((person, index) => (
        <Avatar key={person.id} size="sm" title={person.fullName} aria-label={person.fullName}>
          <AvatarFallback className={colors[index]}>{getInitials(person.fullName)}</AvatarFallback>
        </Avatar>
      ))}
      {remaining > 0 && (
        <AvatarGroupCount
          className="min-w-6 px-1 text-[10px] font-medium"
          title={`Mais ${remaining} ${remaining === 1 ? 'participante' : 'participantes'}`}
          aria-label={`Mais ${remaining} ${remaining === 1 ? 'participante' : 'participantes'}`}
        >
          +{remaining}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
