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
import { Spinner } from '@/shared/components/ui/spinner'
import { useQuickSearch } from '@/features/quick-search/hooks/useQuickSearch'
import { PersonResult } from '@/features/quick-search/components/PersonResult'

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
    const filtro = selectedPerson.fullName
    handleOpenChange(false)
    navigate('/documentos', { state: { quickSearchFilter: filtro } })
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
              <PersonResult person={selectedPerson} showProcess={false} />
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
