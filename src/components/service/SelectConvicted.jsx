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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChevronsUpDown } from 'lucide-react'
import { ConvictedInfoCard } from '@/components/service/ConvictedInfoCard.jsx'

export function SelectConvicted({ atendimento, onChangeAtendimento }) {
  const { apenados } = useDistrictData()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const apenadosFiltrados = useFilteredConvicted(apenados, search)

  const handleSelectApenado = (currentValue) => {
    setOpen(false)
    const apenado = apenados?.find((a) => String(a.id) === currentValue)

    if (apenado) {
      const processoPadrao =
        apenado.processos && apenado.processos.length > 0 ? apenado.processos[0] : null
      onChangeAtendimento({ apenado, processo: processoPadrao })
    } else {
      onChangeAtendimento({ apenado: null, processo: null })
    }
  }

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
              {atendimento.apenado ? (
                atendimento.apenado.fullName
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
                      onSelect={handleSelectApenado}
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

      {atendimento.apenado && (
        <ConvictedInfoCard
          key={atendimento.apenado.id}
          apenado={atendimento.apenado}
          processoAtivo={atendimento.processo}
          onChangeProcesso={(proc) => onChangeAtendimento({ ...atendimento, processo: proc })}
        />
      )}
    </div>
  )
}
