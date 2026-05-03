import { Label } from '@/components/ui/label.jsx'

import { useDistrictData } from '@/lib/useDistrictData.js'
import { useFilteredConvicted } from '@/lib/useFilteredConvicted.js'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { DropdownMenu } from '@/components/ui/dropdown-menu.jsx'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChevronsUpDown } from 'lucide-react'
import { ConvictedInfoCard } from '@/components/service/ConvictedInfoCard.jsx'

export function SelectConvicted() {
  const { apenados } = useDistrictData()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [search, setSearch] = useState('')

  const apenadosFiltrados = useFilteredConvicted(apenados, search)

  const apenadoSelecionado = apenados?.find((a) => String(a.id) === value)

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <div className="space-y-2">
        <Label>
          Apenado <span className="text-destructive font-light">*</span>
        </Label>
        <Popover className="flex w-full" open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-between bg-transparent"
            >
              {value && apenadoSelecionado ? (
                apenadoSelecionado.fullName
              ) : (
                <span className="text-muted-foreground font-normal">Selecione um apenado</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Buscar por nome ou CPF" onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>Nenhum apenado encontrado.</CommandEmpty>
                <CommandGroup>
                  {apenadosFiltrados.map((a) => (
                    <CommandItem
                      key={a.id}
                      value={String(a.id)}
                      onSelect={(currentValue) => {
                        setValue(currentValue)
                        setOpen(false)
                      }}
                      className="flex flex-col items-start px-2 py-1.5"
                    >
                      <span className="w-full truncate text-left font-medium">{a.fullName}</span>
                      <span className="text-muted-foreground w-full truncate text-left text-xs">
                        {a.cpf}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {value && apenadoSelecionado && (
        <ConvictedInfoCard apenado={apenadoSelecionado}></ConvictedInfoCard>
      )}

      <div className="space-y-2">
        <Label>Data e Hora</Label>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm font-medium">
            {new Date().toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Automático</p>
        </div>
      </div>
    </div>
  )
}
