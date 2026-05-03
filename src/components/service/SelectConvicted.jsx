import { Label } from '@/components/ui/label.jsx'

import { useDistrictData } from '@/lib/useDistrictData.js'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { ChevronsUpDown } from 'lucide-react'
import { ConvictedInfoCard } from '@/components/service/ConvictedInfoCard.jsx'

export function SelectConvicted() {
  const { apenados } = useDistrictData()

  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const [search, setSearch] = useState('')

  const apenadosFiltrados = useMemo(() => {
    if (!apenados || apenados.length === 0) return []

    const s = search.toLowerCase()
    const resultados = []

    if (!search) {
      const limite = Math.min(apenados.length, 5)
      for (let i = 0; i < limite; i++) {
        resultados.push(apenados[i])
      }
      return resultados
    }

    for (const a of apenados) {
      const matchesNome = a.fullName.toLowerCase().includes(s)
      const matchesCpf = a.cpf.toLowerCase().includes(s)

      if (matchesNome || matchesCpf) {
        resultados.push(a)
      }

      if (resultados.length === 5) break
    }
    return resultados
  }, [search, apenados])

  const apenadoSelecionado = apenados.find((a) => String(a.id) === value)

  return (
    <div className="w-full space-y-2">
      <Label>
        Apenado <span className="text-destructive font-light">*</span>
      </Label>
      <Popover className="flex w-full" open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {value && apenadoSelecionado ? (
              apenadoSelecionado.fullName
            ) : (
              <span className="text-muted-foreground font-light">Selecione um apenado</span>
            )}
            <ChevronsUpDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) border-none p-0">
          <Command shouldFilter={false} className="border-none p-0">
            <CommandInput
              className="h-full! w-full! border-none! bg-transparent shadow-none!"
              placeholder="Buscar por nome ou CPF"
              onValueChange={setSearch}
            />
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
                  >
                    <span className="truncate">{a.fullName}</span>
                    <span className="text-muted-foreground truncate text-xs">{a.cpf}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
            })}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">Automático</p>
        </div>
      </div>
    </div>
  )
}

export default SelectConvicted
