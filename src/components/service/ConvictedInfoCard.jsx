import { useState, useEffect } from 'react'
import { Pencil, AlertCircle } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function ConvictedInfoCard({
  apenado,
  processoAtivo,
  onChangeProcesso,
  onChangeApenado,
  onMudancasDetectadas,
}) {
  const [canEdit, setCanEdit] = useState(false)

  // Como o componente recria quando a key muda, podemos iniciar o estado diretamente
  const [apenadoOriginal] = useState(() => ({
    phone: apenado?.phone,
    address: apenado?.address,
    workingStatus: apenado?.workingStatus,
  }))

  const [mudancasRastreadas, setMudancasRastreadas] = useState({})

  useEffect(() => {
    if (onMudancasDetectadas) {
      onMudancasDetectadas(mudancasRastreadas)
    }
  }, [mudancasRastreadas, onMudancasDetectadas])

  const processosAtivos = (apenado.processos || []).filter((p) => p.status === 'ATIVO')

  const handleFieldChange = (field, newValue) => {
    if (!canEdit) return

    const original = apenadoOriginal?.[field]
    const isChanged = original !== newValue

    setMudancasRastreadas((prev) => ({
      ...prev,
      [field]: {
        original,
        novo: newValue,
        mudou: isChanged,
      },
    }))

    onChangeApenado?.({ ...apenado, [field]: newValue })
  }

  const temMudancas = Object.values(mudancasRastreadas).some((m) => m.mudou)

  const formatPhone = (val) => {
    if (!val) return ''
    let value = val.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    if (value.length > 10) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
    } else if (value.length > 6) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`
    } else if (value.length > 2) {
      return `(${value.slice(0, 2)}) ${value.slice(2)}`
    }
    return value
  }

  const handlePhoneInput = (e) => {
    const formatted = formatPhone(e.target.value)
    e.target.value = formatted
    handleFieldChange('phone', formatted)
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
      {processosAtivos.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Processo Ativo</Label>
            <Select
              value={processoAtivo ? String(processoAtivo.id) : ''}
              onValueChange={(id) => {
                const proc = processosAtivos.find((p) => String(p.id) === id)
                if (proc) {
                  onChangeProcesso(proc)
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Selecione um processo" />
              </SelectTrigger>
              <SelectContent>
                {processosAtivos.map((processo) => (
                  <SelectItem key={processo.id} value={String(processo.id)}>
                    {processo.processNumber || processo.numeroProcesso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {processoAtivo && (
            <div className="bg-muted/50 space-y-2 rounded-lg p-4 text-sm wrap-break-word">
              <p>
                <span className="text-muted-foreground">Processo:</span>{' '}
                {processoAtivo.processNumber || processoAtivo.numeroProcesso}
              </p>
              <p>
                <span className="text-muted-foreground">Situação:</span>{' '}
                {processoAtivo.judicialStatus || processoAtivo.tipoPena}
              </p>
              {processoAtivo.institution && (
                <p>
                  <span className="text-muted-foreground">Instituição:</span>{' '}
                  {processoAtivo.institution}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted/50 space-y-2 rounded-lg p-4 text-center text-sm">
          <p className="text-muted-foreground">Nenhum processo ativo vinculado a este apenado.</p>
        </div>
      )}

      <div className="flex items-start gap-2 pt-2 md:items-center">
        <Checkbox
          id="enableEditing"
          checked={canEdit}
          onCheckedChange={setCanEdit}
          className="mt-1 shrink-0 md:mt-0"
        />
        <Label
          htmlFor="enableEditing"
          className="flex cursor-pointer items-center gap-2 text-sm leading-relaxed font-medium md:leading-none"
        >
          <Pencil className="h-4 w-4 shrink-0" />
          Habilitar edição dos dados para este comprovante
        </Label>
      </div>

      <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
        {temMudancas && (
          <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium">Dados modificados</p>
              <p className="mt-1 text-xs">
                {Object.entries(mudancasRastreadas)
                  .filter(([, m]) => m.mudou)
                  .map(([field]) => {
                    const labels = {
                      phone: 'Telefone',
                      address: 'Endereço',
                      workingStatus: 'Situação Trabalhista',
                    }
                    return labels[field]
                  })
                  .join(', ')}
              </p>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <Label htmlFor="editPhone">Telefone</Label>
          <Input
            id="editPhone"
            name="phone"
            type="tel"
            key={`phone-${apenado?.id}`}
            disabled={!canEdit}
            minLength={14}
            maxLength={15}
            pattern="^\(\d{2}\) \d{4,5}-\d{4}$"
            title="O telefone deve conter DDD e entre 8 a 9 números."
            placeholder="(00) 00000-0000"
            defaultValue={formatPhone(apenado.phone)}
            onChange={handlePhoneInput}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="editAddress">Endereço</Label>
          <Input
            id="editAddress"
            name="address"
            key={`address-${apenado?.id}`}
            disabled={!canEdit}
            placeholder="Rua, número..."
            defaultValue={apenado.address || ''}
            onChange={(e) => handleFieldChange('address', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Situação Trabalhista</Label>
          <Select
            disabled={!canEdit}
            name="workingStatus"
            value={apenado.workingStatus || ''}
            onValueChange={(value) => handleFieldChange('workingStatus', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="not_working">Não Trabalha</SelectItem>
              <SelectItem value="working_formal">Trabalha</SelectItem>
              <SelectItem value="working_informal">Autônomo</SelectItem>
            </SelectContent>
          </Select>
          {!canEdit && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Marque a opcao acima para editar os dados antes de gerar o comprovante.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
