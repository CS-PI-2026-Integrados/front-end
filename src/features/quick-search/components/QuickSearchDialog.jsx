import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, FolderArchive } from 'lucide-react'
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
import { PersonResult } from '@/features/quick-search/components/PersonResult'

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
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedPerson, setSelectedPerson] = useState(null)
  const { results, isLoading, error } = useQuickSearch(query)
  const hasQuery = Boolean(query.trim())

  const reset = () => {
    setQuery('')
    setSelectedPerson(null)
  }

  const handleOpenChange = (next) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const goToReceipt = () => {
    handleOpenChange(false)
    navigate('/atendimento')
  }

  const goToDocuments = () => {
    handleOpenChange(false)
    navigate('/documentos')
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Busca rápida"
      description="Busque por CPF, nome ou nº do processo"
    >
      <Command shouldFilter={false}>
        {selectedPerson ? (
          <>
            <div className="flex items-center gap-3 border-b p-3">
              <button
                type="button"
                onClick={() => setSelectedPerson(null)}
                aria-label="Voltar"
                className="hover:bg-muted text-muted-foreground rounded-md p-1"
              >
                <ArrowLeft className="size-4" />
              </button>
              <Avatar size="sm">
                <AvatarImage
                  src={selectedPerson.photoUrl || undefined}
                  alt={selectedPerson.fullName}
                />
                <AvatarFallback>{getInitials(selectedPerson.fullName)}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{selectedPerson.fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  CPF {selectedPerson.cpf}
                </span>
              </div>
            </div>
            <CommandList>
              <CommandGroup heading="Ações">
                <CommandItem value="comprovante" onSelect={goToReceipt} className="gap-2 py-2">
                  <FileText className="size-4" /> Emitir comprovante de presença
                </CommandItem>
                <CommandItem value="documentos" onSelect={goToDocuments} className="gap-2 py-2">
                  <FolderArchive className="size-4" /> Ver documentos
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </>
        ) : (
          <>
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
                      onSelect={() => setSelectedPerson(person)}
                      className="gap-3 py-2"
                    >
                      <PersonResult person={person} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </>
        )}
      </Command>
    </CommandDialog>
  )
}
