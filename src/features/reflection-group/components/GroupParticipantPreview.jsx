import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/shared/components/ui/avatar'
import { getInitials } from '@/shared/lib/getInitials'

const avatarColors = [
  'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200',
]

export function GroupParticipantPreview({ participants, participantCount = 0 }) {
  if (!participants?.length) {
    return (
      <span className="text-muted-foreground text-xs">
        {participantCount > 0 ? 'Iniciais indisponíveis' : 'Sem participantes'}
      </span>
    )
  }

  const visibleParticipants = participants.slice(0, 3)
  const hiddenCount = Math.max(participantCount, participants.length) - visibleParticipants.length
  const accessibleNames = visibleParticipants.map((person) => person.fullName).join(', ')
  const accessibleLabel =
    hiddenCount > 0
      ? `${accessibleNames} e mais ${hiddenCount} participante${hiddenCount === 1 ? '' : 's'}`
      : accessibleNames

  return (
    <AvatarGroup
      role="img"
      aria-label={`Participantes: ${accessibleLabel}`}
      className="*:data-[slot=avatar]:ring-background mt-1"
    >
      {visibleParticipants.map((person, index) => (
        <Avatar
          key={person.id}
          size="sm"
          aria-hidden="true"
          className={avatarColors[index % avatarColors.length]}
        >
          <AvatarFallback className={avatarColors[index % avatarColors.length]}>
            {getInitials(person.fullName)}
          </AvatarFallback>
        </Avatar>
      ))}
      {hiddenCount > 0 && (
        <AvatarGroupCount aria-hidden="true" className="text-[10px] font-medium">
          +{hiddenCount}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}
