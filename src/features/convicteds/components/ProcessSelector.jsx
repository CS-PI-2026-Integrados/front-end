import { Check, Users, X } from 'lucide-react'
import { useState } from 'react'
import { useProcessSearch } from '../hooks/useProcessSearch'
import { SearchPopover } from '@/shared/components/SearchPopover'
import { FieldLayout } from '@/shared/components/form-fields/FieldLayout'
import { Button } from '@/shared/components/ui/button'

export function ProcessSelector({ processes = [], onChange, onBlur, error, disabled }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const search = useProcessSearch(query, { enabled: open && !disabled })
  const selectProcess = (process) => {
    if (processes.some((item) => item.id === process.id)) return
    onChange([...processes, { ...process, principal: processes.length === 0 }])
  }
  const removeProcess = (id) => {
    const remaining = processes.filter((item) => item.id !== id)
    if (remaining.length && !remaining.some((item) => item.principal))
      remaining[0] = { ...remaining[0], principal: true }
    onChange(remaining)
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
          <SearchPopover
            {...controls}
            label="Processo"
            placeholder="Selecione um processo"
            searchPlaceholder="Buscar pelo número do processo (mín. 3 caracteres)"
            open={open}
            onOpenChange={(next) => {
              setOpen(next)
              if (!next) onBlur?.()
            }}
            query={query}
            onQueryChange={setQuery}
            items={search.items.filter(
              (item) => !processes.some((selected) => selected.id === item.id)
            )}
            onSelect={selectProcess}
            renderItem={(item) => item.number}
            minLength={3}
            isLoading={search.isLoading}
            error={search.error}
            emptyMessage="Nenhum processo ativo encontrado."
            loadingMessage="Buscando processos..."
          />
        )}
      </FieldLayout>
      {processes.map((process) => (
        <div key={process.id} className="space-y-2">
          <div className="bg-muted/50 flex items-center gap-2 rounded-md p-2 text-sm">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
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
              disabled={disabled}
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
