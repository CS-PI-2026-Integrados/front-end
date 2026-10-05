import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar'
import { getInitials } from '@/shared/lib/getInitials'

export function PersonResult({ person, showProcess = true }) {
  return (
    <>
      <Avatar size="sm">
        <AvatarImage src={person.photoUrl || undefined} alt={person.fullName} />
        <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{person.fullName}</span>
        <span className="text-muted-foreground truncate text-xs">
          CPF {person.cpf}
          {showProcess && person.processNumber ? ` · Processo ${person.processNumber}` : ''}
        </span>
      </div>
    </>
  )
}
