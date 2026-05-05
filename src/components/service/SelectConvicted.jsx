import { Label } from '@/components/ui/label.jsx'
import { useDistrictData } from '@/hooks/useDistrictData.js'
import { useFilteredConvicted } from '@/hooks/useFilteredConvicted.js'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useState } from 'react'
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
      <div className="space-y-1">
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
                      className="px-2 py-2"
                    >
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                        <span className="w-full truncate text-left text-sm leading-none font-medium">
                          {a.fullName}
                        </span>
                        <span className="text-muted-foreground w-full truncate text-left text-xs leading-none">
                          {a.cpf}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {atendimento.apenado ? (
        <ConvictedInfoCard
          key={atendimento.apenado.id}
          apenado={atendimento.apenado}
          processoAtivo={atendimento.processo}
          onChangeProcesso={(proc) => onChangeAtendimento({ ...atendimento, processo: proc })}
          onChangeApenado={(novoApenado) =>
            onChangeAtendimento({ ...atendimento, apenado: novoApenado })
          }
        />
      ) : (
        <div className="bg-muted/30 flex min-h-[140px] flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">
            Selecione o apenado para iniciar um atendimento
          </p>
        </div>
      )}
    </div>
  )
}
