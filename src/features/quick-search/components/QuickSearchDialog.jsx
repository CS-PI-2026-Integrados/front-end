import { useState } from 'react'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
} from '@/shared/components/ui/command'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/components/ui/avatar'
import { Spinner } from '@/shared/components/ui/spinner'
import { useQuickSearch } from '@/features/quick-search/hooks/useQuickSearch'

const getInitials = (name) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return '?'
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function QuickSearchDialog({ open, onOpenChange }) {
  const [query, setQuery] = useState('')
  const { results, isLoading, error } = useQuickSearch(query)
  const hasQuery = Boolean(query.trim())

  const handleOpenChange = (next) => {
    if (!next) setQuery('')
    onOpenChange(next)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Busca rápida"
      description="Busque por CPF, nome ou nº do processo"
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Buscar por CPF, Nome ou nº do processo"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!hasQuery && !isLoading && !error && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Digite um nome ou CPF para buscar.
            </p>
          )}

          {isLoading && (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
              <Spinner /> Buscando...
            </div>
          )}

          {!isLoading && error && (
            <p className="text-destructive py-6 text-center text-sm">{error}</p>
          )}

          {!isLoading && !error && hasQuery && results.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Nenhuma pessoa encontrada.
            </p>
          )}

          {!isLoading && !error && results.length > 0 && (
            <CommandGroup heading="Pessoas">
              {results.map((person) => (
                <CommandItem
                  key={person.id}
                  value={person.id}
                  onSelect={() => handleOpenChange(false)}
                  className="gap-3 py-2"
                >
                  <Avatar size="sm">
                    <AvatarImage src={person.photoUrl || undefined} alt={person.fullName} />
                    <AvatarFallback>{getInitials(person.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{person.fullName}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      CPF {person.cpf}
                      {person.processNumber ? ` · Processo ${person.processNumber}` : ''}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
