import { useState } from 'react'
import { Pencil } from 'lucide-react'

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

export function ConvictedInfoCard({ apenado, processoAtivo, onChangeProcesso, onChangeApenado }) {
  const [canEdit, setCanEdit] = useState(false)

  const processos = apenado.processos || []

  const handleFieldChange = (field, newValue) => {
    if (!canEdit) return

    const currentValue = apenado[field] || ''
    if (newValue !== currentValue) {
      onChangeApenado?.({ ...apenado, [field]: newValue })
    }
  }

  const handlePhoneInput = (e) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)

    let formatted = value
    if (value.length > 2 && value.length <= 6) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else if (value.length > 6 && value.length <= 10) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`
    } else if (value.length > 10) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
    }
    e.target.value = formatted
  }

  return (
    <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
      {processos.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Processo Ativo</Label>
            <Select
              value={processoAtivo ? String(processoAtivo.id) : ''}
              onValueChange={(id) => {
                const proc = processos.find((p) => String(p.id) === id)
                if (proc) {
                  onChangeProcesso(proc)
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um processo" />
              </SelectTrigger>
              <SelectContent>
                {processos.map((processo) => (
                  <SelectItem key={processo.id} value={String(processo.id)}>
                    {processo.processNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {processoAtivo && (
            <div className="bg-muted/50 space-y-2 rounded-lg p-4 text-sm wrap-break-word">
              <p>
                <span className="text-muted-foreground">Processo:</span>{' '}
                {processoAtivo.processNumber}
              </p>
              <p>
                <span className="text-muted-foreground">Situação:</span>{' '}
                {processoAtivo.judicialStatus}
              </p>
              <p>
                <span className="text-muted-foreground">Instituição:</span>{' '}
                {processoAtivo.institution}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-muted/50 space-y-2 rounded-lg p-4 text-center text-sm">
          <p className="text-muted-foreground">Nenhum processo vinculado a este apenado.</p>
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
        <div className="space-y-2">
          <Label htmlFor="editPhone">Telefone</Label>
          <Input
            id="editPhone"
            name="phone"
            type="tel"
            key={`phone-${apenado?.id}`}
            disabled={!canEdit}
            placeholder="(00) 00000-0000"
            defaultValue={apenado.phone}
            onChange={handlePhoneInput}
            onBlur={(e) => handleFieldChange('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editAddress">Endereço</Label>
          <Input
            id="editAddress"
            name="address"
            key={`address-${apenado?.id}`}
            disabled={!canEdit}
            placeholder="Rua, número..."
            defaultValue={apenado.address || ''}
            onBlur={(e) => handleFieldChange('address', e.target.value)}
          />
        </div>

        <div className="space-y-2">
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
