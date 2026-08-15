import { useState } from 'react'

import { Button } from '@/shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Input } from '@/shared/components/ui/input'

const VARAS = ['Vara criminal', 'Juizado criminal', 'Execução meio aberto', 'Execução meio fechado']
const TIPOS_PENA = [
  'Comparecimento periódico',
  'Prestação de serviço à comunidade',
  'Grupo reflexivo',
  'Restrição de fim de semana',
  'Outra',
]

export function ProcessoCard({ processo, index, onChange, onEncerrar, errors = {} }) {
  const isEncerrado = processo.situacao === 'encerrado'
  const [aberto, setAberto] = useState(!isEncerrado)

  const atualizar = (campo, valor) => onChange(index, { ...processo, [campo]: valor })

  return (
    <section className={`rounded-lg border ${isEncerrado ? 'bg-muted/40 opacity-80' : 'bg-card'}`}>
      <Button
        type="button"
        variant="ghost"
        className="flex h-auto w-full items-center justify-between rounded-b-none px-4 py-3 text-left hover:bg-transparent"
        onClick={() => setAberto((valor) => !valor)}
      >
        <span>
          <span className="block text-sm font-semibold">
            {processo.numeroProcesso || `Processo ${index + 1}`}
          </span>
          <span className="text-muted-foreground block text-xs">
            {processo.vara || 'Vara não definida'} · {processo.tipoPena || 'Tipo não definido'}
          </span>
        </span>
        <span className="text-muted-foreground text-xs">
          {isEncerrado ? 'ENCERRADO' : aberto ? 'RECOLHER' : 'EXPANDIR'}
        </span>
      </Button>

      {aberto && (
        <div className="space-y-3 border-t px-4 py-3">
          <label className="block text-sm font-medium">
            Número do processo
            <Input
              className="mt-1"
              value={processo.numeroProcesso}
              disabled={isEncerrado}
              placeholder="0000000-00.0000.0.00.0000"
              onChange={(event) => atualizar('numeroProcesso', event.target.value)}
            />
            {errors.numeroProcesso && (
              <span className="text-destructive text-xs">{errors.numeroProcesso}</span>
            )}
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Vara vinculada
              <Select
                value={processo.vara}
                disabled={isEncerrado}
                onValueChange={(valor) => atualizar('vara', valor)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {VARAS.map((vara) => (
                    <SelectItem key={vara} value={vara}>
                      {vara}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vara && <span className="text-destructive text-xs">{errors.vara}</span>}
            </label>
            <label className="block text-sm font-medium">
              Tipo de pena
              <Select
                value={processo.tipoPena}
                disabled={isEncerrado}
                onValueChange={(valor) => atualizar('tipoPena', valor)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_PENA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoPena && (
                <span className="text-destructive text-xs">{errors.tipoPena}</span>
              )}
            </label>
          </div>

          {!isEncerrado && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onEncerrar(index)}
              >
                Encerrar processo
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
