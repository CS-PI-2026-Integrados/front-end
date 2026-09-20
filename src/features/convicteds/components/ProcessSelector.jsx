import { Check, ChevronsUpDown, Loader2, Plus, Users, X } from 'lucide-react'
import { useState } from 'react'

import { useProcessSearch } from '@/features/convicteds/hooks/useProcessSearch'
import { Button } from '@/shared/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { Label } from '@/shared/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'

export function ProcessSelector({ processes = [], onChange, error }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { items, isLoading, error: searchError } = useProcessSearch(query, { enabled: open })

  const selectProcess = (process) => {
    if (processes.some((item) => item.id === process.id)) return

    onChange([
      ...processes,
      {
        ...process,
        principal: processes.length === 0,
      },
    ])
    setQuery('')
    setOpen(false)
  }

  const removeProcess = (processId) => {
    const remaining = processes.filter((process) => process.id !== processId)
    if (remaining.length > 0 && !remaining.some((process) => process.principal)) {
      remaining[0] = { ...remaining[0], principal: true }
    }
    onChange(remaining)
  }

  const setPrincipal = (processId) => {
    onChange(processes.map((process) => ({ ...process, principal: process.id === processId })))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="convicted-process-search">Processo</Label>
      <div className="flex gap-1.5">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-9 flex-1 justify-between bg-transparent px-2.5 text-left font-normal"
            >
              <span className="text-muted-foreground truncate">
                Pesquisar pelo número do processo
              </span>
              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={4}
            className="w-(--radix-popover-trigger-width) p-0"
          >
            <Command shouldFilter={false}>
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder="Digite pelo menos 3 caracteres"
              />
              <CommandList className="max-h-52">
                {query.trim().length < 3 ? (
                  <CommandEmpty>Digite pelo menos 3 caracteres.</CommandEmpty>
                ) : isLoading ? (
                  <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                    <Loader2 className="size-4 animate-spin" /> Buscando processos...
                  </div>
                ) : searchError ? (
                  <CommandEmpty>{searchError}</CommandEmpty>
                ) : (
                  <>
                    <CommandEmpty>Nenhum processo ativo encontrado.</CommandEmpty>
                    <CommandGroup>
                      {items.map((process) => (
                        <CommandItem
                          key={process.id}
                          value={process.number}
                          onSelect={() => selectProcess(process)}
                          className="px-2 py-2"
                        >
                          <span className="truncate">{process.number}</span>
                          <Check
                            className={`ml-auto size-4 ${processes.some((item) => item.id === process.id) ? 'opacity-100' : 'opacity-0'}`}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Adicionar processo"
          onClick={() => setOpen(true)}
        >
          <Plus />
          <span className="sr-only">Adicionar processo</span>
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}

      {processes.length > 0 && (
        <div className="space-y-2">
          {processes.map((process) => (
            <div key={process.id} className="space-y-2">
              <div className="bg-muted/50 flex items-center gap-2 rounded-md p-2 text-sm">
                <button
                  type="button"
                  title={process.principal ? 'Processo principal' : 'Definir como principal'}
                  onClick={() => setPrincipal(process.id)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Check
                    className={process.principal ? 'text-primary size-4' : 'size-4 opacity-30'}
                  />
                  <span className="sr-only">
                    {process.principal ? 'Processo principal' : 'Definir como principal'}
                  </span>
                </button>
                <span className="min-w-0 flex-1 truncate">{process.number}</span>
                <button
                  type="button"
                  title="Remover processo"
                  onClick={() => removeProcess(process.id)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <X className="size-4" />
                  <span className="sr-only">Remover processo</span>
                </button>
              </div>
              {process.linkedConvictedCount > 0 && (
                <div className="bg-muted/50 text-muted-foreground flex gap-2 rounded-md p-3 text-xs leading-relaxed">
                  <Users className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p>
                      Este processo já possui {process.linkedConvictedCount} apenado(s)
                      vinculado(s):
                    </p>
                    {process.linkedConvictedNames.length > 0 && (
                      <p className="text-foreground mt-0.5 font-medium">
                        {process.linkedConvictedNames.join(', ')}
                      </p>
                    )}
                    <p>O cadastro será registrado como corréu no mesmo processo.</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
