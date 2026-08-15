import { Label } from '@/shared/components/ui/label.jsx'
import { useAtendimentoData } from '@/features/atendimento/hooks/useAtendimentoData.js'
import { useFilteredConvicted } from '@/features/atendimento/hooks/useFilteredConvicted.js'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button.jsx'
import { ChevronsUpDown } from 'lucide-react'
import { useAtendimento } from '@/features/atendimento'
import { ConvictedInfoCard } from '@/features/atendimento/components/service/ConvictedInfoCard.jsx'

export function SelectConvicted() {
  const { apenado, selectApenado } = useAtendimento()

  const { apenados } = useAtendimentoData()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const apenadosFiltrados = useFilteredConvicted(apenados, search)

  const handleSelectApenado = (idSelecionado) => {
    setOpen(false)
    const apenadoSelecionado = apenados?.find((a) => String(a.id) === idSelecionado)
    selectApenado(apenadoSelecionado || null)
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
              type="button"
              variant="outline"
              role="combobox"
              className="h-10 w-full justify-between bg-transparent"
            >
              {apenado ? (
                apenado.nomeCompleto
              ) : (
                <span className="text-muted-foreground font-normal">Selecione um apenado</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            avoidCollisions={false}
            className="w-(--radix-popover-trigger-width) p-0"
          >
            <Command shouldFilter={false}>
              <CommandInput placeholder="Buscar por nome ou CPF" onValueChange={setSearch} />
              <CommandList className="max-h-[200px]">
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
                          {a.nomeCompleto}
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

      {apenado && <ConvictedInfoCard key={apenado.id} />}
    </div>
  )
}
