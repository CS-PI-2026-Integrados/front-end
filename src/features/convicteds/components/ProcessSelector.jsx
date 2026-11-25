import { Check, Loader2, Plus, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useProcessSearch } from '../hooks/useProcessSearch'
import { useProcessCreation } from '../hooks/useProcessCreation'
import { processNumberSchema } from '../schemas/processSchema'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { FieldLayout } from '@/shared/components/form-fields/FieldLayout'
import { Button } from '@/shared/components/ui/button'

export function ProcessSelector({ processes = [], onChange, onBlur, error, disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const search = useProcessSearch(query, { enabled: open && !disabled })
  const creation = useProcessCreation()
  const candidate = processNumberSchema.safeParse(query)
  const matchesNumber = (process) =>
    candidate.success && process.number.replace(/\D/g, '') === candidate.data.replace(/\D/g, '')
  const alreadySelected = processes.some(matchesNumber)
  const availableProcesses = search.items.filter(
    (item) => !processes.some((selected) => selected.id === item.id)
  )
  const canCreate =
    candidate.success &&
    !search.isLoading &&
    !search.error &&
    !search.items.some(matchesNumber) &&
    !alreadySelected
  const selectProcess = (process) => {
    if (processes.some((item) => item.id === process.id)) return
    onChange([...processes, { ...process, principal: processes.length === 0 }])
    setQuery('')
    setOpen(false)
    onBlur?.()
  }
  const removeProcess = (id) => {
    const remaining = processes.filter((item) => item.id !== id)
    if (remaining.length && !remaining.some((item) => item.principal))
      remaining[0] = { ...remaining[0], principal: true }
    onChange(remaining)
  }
  const createProcess = async () => {
    if (!canCreate || disabled) return
    const process = await creation.create(candidate.data)
    if (!process) return
    selectProcess(process)
  }
  return (
    <div className="space-y-2">
      <FieldLayout
        id="convicted-process-search"
        label="Processo"
        variant="modal"
        error={error}
        disabled={disabled}
      >
        {(controls) => (
          <Command
            label="Processo"
            shouldFilter={false}
            className="h-auto overflow-visible rounded-md! border bg-transparent p-0"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setOpen(false)
                onBlur?.()
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && open) {
                event.preventDefault()
                event.stopPropagation()
                setOpen(false)
              }
              if (event.key === 'Enter' && (!open || (!availableProcesses.length && !canCreate)))
                event.preventDefault()
            }}
          >
            <CommandInput
              {...controls}
              aria-label="Processo"
              aria-expanded={open && query.trim().length >= 3}
              placeholder="Digite o número do processo"
              value={query}
              disabled={disabled}
              readOnly={creation.isCreating}
              aria-busy={creation.isCreating}
              onFocus={() => setOpen(true)}
              onValueChange={(value) => {
                setQuery(value)
                setOpen(true)
                creation.clearError()
              }}
            />
            {open && query.trim().length >= 3 && !disabled && (
              <CommandList className="max-h-60 border-t">
                {search.isLoading ? (
                  <p role="status" className="text-muted-foreground px-3 py-2 text-sm">
                    Buscando processos...
                  </p>
                ) : search.error ? (
                  <p role="alert" className="text-destructive px-3 py-2 text-sm">
                    {search.error}
                  </p>
                ) : (
                  <CommandGroup>
                    {availableProcesses.map((process) => (
                      <CommandItem
                        key={process.id}
                        value={process.id}
                        disabled={creation.isCreating}
                        className="py-2"
                        onMouseDown={(event) => event.preventDefault()}
                        onSelect={() => selectProcess(process)}
                      >
                        {process.number}
                      </CommandItem>
                    ))}
                    {!availableProcesses.length && !canCreate && !alreadySelected && (
                      <p className="text-muted-foreground px-2 py-2 text-sm">
                        Nenhum processo ativo encontrado.
                      </p>
                    )}
                    {canCreate && (
                      <CommandItem
                        value="create-process"
                        className="py-2 whitespace-normal"
                        disabled={creation.isCreating}
                        onMouseDown={(event) => event.preventDefault()}
                        onSelect={createProcess}
                      >
                        {creation.isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
                        {creation.isCreating
                          ? 'Cadastrando processo...'
                          : `Cadastrar novo processo: ${candidate.data}`}
                      </CommandItem>
                    )}
                  </CommandGroup>
                )}
                {alreadySelected && (
                  <p role="status" className="text-muted-foreground px-3 py-2 text-sm">
                    Este processo já está selecionado.
                  </p>
                )}
                {creation.error && (
                  <p role="alert" className="text-destructive px-3 py-2 text-sm">
                    {creation.error}
                  </p>
                )}
              </CommandList>
            )}
          </Command>
        )}
      </FieldLayout>
      {processes.map((process) => (
        <div key={process.id} className="space-y-2">
          <div className="bg-muted/50 flex items-center gap-2 rounded-md p-2 text-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled || creation.isCreating}
              aria-pressed={process.principal}
              aria-label={`Definir ${process.number} como principal`}
              onClick={() =>
                onChange(processes.map((item) => ({ ...item, principal: item.id === process.id })))
              }
            >
              <Check className={process.principal ? 'text-primary' : 'opacity-30'} />
            </Button>
            <span className="min-w-0 flex-1 truncate">{process.number}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled || creation.isCreating}
              aria-label={`Remover processo ${process.number}`}
              onClick={() => removeProcess(process.id)}
            >
              <X />
            </Button>
          </div>
          {process.linkedConvictedCount > 0 && (
            <div className="bg-muted/50 text-muted-foreground flex gap-2 rounded-md p-3 text-xs leading-relaxed">
              <Users className="mt-0.5 size-4 shrink-0" />
              <div>
                <p>
                  Este processo já possui {process.linkedConvictedCount} apenado(s) vinculado(s):
                </p>
                {process.linkedConvictedNames?.length > 0 && (
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
  )
}
