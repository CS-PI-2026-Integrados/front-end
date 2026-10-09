import { useState } from 'react'
import { X } from 'lucide-react'
import { useConvictedList } from '@/features/convicteds'
import { SearchPopover } from '@/shared/components/SearchPopover'
import { FieldLayout } from '@/shared/components/form-fields/FieldLayout'
import { Button } from '@/shared/components/ui/button'

export function GroupParticipantsField({ field, error, disabled, readOnly }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const selected = field.value || []
  const list = useConvictedList({
    search: query.trim(),
    page: 1,
    limit: 20,
    enabled: open && Boolean(query.trim()) && !disabled && !readOnly,
  })
  return (
    <div className="space-y-2">
      {!readOnly && (
        <FieldLayout
          id="group-participants"
          label="Apenados"
          variant="modal"
          error={error}
          disabled={disabled}
        >
          {(controls) => (
            <SearchPopover
              {...controls}
              label="Apenados"
              placeholder="Selecione um apenado"
              searchPlaceholder="Buscar por nome ou CPF"
              open={open}
              onOpenChange={(next) => {
                setOpen(next)
                if (!next) field.onBlur()
              }}
              query={query}
              onQueryChange={setQuery}
              items={list.items.filter((person) => !selected.some((item) => item.id === person.id))}
              isLoading={list.isLoading}
              error={list.error}
              emptyMessage="Nenhum apenado encontrado."
              loadingMessage="Buscando apenados..."
              onSelect={(person) => {
                if (!selected.some((item) => item.id === person.id))
                  field.onChange([
                    ...selected,
                    { id: person.id, fullName: person.fullName, cpf: person.cpf },
                  ])
              }}
              renderItem={(person) => (
                <div className="flex min-w-0 gap-3">
                  <span className="truncate">{person.fullName}</span>
                  <span className="text-muted-foreground text-xs">{person.cpf}</span>
                </div>
              )}
            />
          )}
        </FieldLayout>
      )}
      {selected.map((person) => (
        <div
          key={person.id}
          className="bg-muted/50 flex items-center justify-between gap-3 rounded-md p-2 text-sm"
        >
          <div className="min-w-0">
            <p className="truncate">{person.fullName}</p>
            <p className="text-muted-foreground text-xs">{person.cpf}</p>
          </div>
          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              aria-label={`Remover apenado ${person.fullName}`}
              onClick={() => field.onChange(selected.filter((item) => item.id !== person.id))}
            >
              <X />
            </Button>
          )}
        </div>
      ))}
      {readOnly && (
        <p className="text-muted-foreground text-xs">
          Participantes só podem ser alterados em grupos em planejamento.
        </p>
      )}
    </div>
  )
}
