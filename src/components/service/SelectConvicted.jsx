import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
import { ChevronsUpDown, Search } from 'lucide-react'

export function SelectConvicted() {
  const { apenados, presencas } = useDistrictData()

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

  return (
    <div className="w-full space-y-2">
      <Label>
        Apenado <span className="text-destructive font-light">*</span>
      </Label>
      <Popover className="flex w-full" open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {value ? (
              apenados.filter((a) => a.id === value)
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
    </div>
  )
}

export default SelectConvicted
