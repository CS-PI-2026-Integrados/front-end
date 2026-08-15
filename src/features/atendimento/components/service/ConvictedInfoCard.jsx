import { useState, useMemo } from 'react'
import { Pencil, AlertCircle } from 'lucide-react'

import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

import { useAtendimento } from '@/features/atendimento'
import { useTenant } from '@/features/instituicoes/context/tenantContext'
import { formatPhone } from '@/features/atendimento/utils/atendimentoUtils'

export function ConvictedInfoCard() {
  const {
    apenado,
    processo,
    canEdit,
    mudancas,
    hasChanges,
    updateField,
    selectProcesso,
    toggleEdit,
  } = useAtendimento()

  const { state: tenantState } = useTenant()

  const fieldConfig = useMemo(() => {
    const map = {}
    ;(tenantState.receiptFields || []).forEach((f) => {
      map[f.key] = { visible: f.visible, editable: f.editable }
    })
    return map
  }, [tenantState.receiptFields])

  const isFieldVisible = (key) => fieldConfig[key]?.visible !== false
  const isFieldEditable = (key) => fieldConfig[key]?.editable !== false

  const hasAnyEditable = useMemo(
    () => (tenantState.receiptFields || []).some((f) => f.visible && f.editable),
    [tenantState.receiptFields]
  )

  const [localPhone, setLocalPhone] = useState(apenado ? formatPhone(apenado.phone || '') : '')
  const [localAddress, setLocalAddress] = useState(apenado ? apenado.address || '' : '')

  if (!apenado) {
    return (
      <div className="bg-muted/30 flex min-h-35 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <p className="text-muted-foreground text-sm">
          Selecione o apenado para iniciar um atendimento
        </p>
      </div>
    )
  }

  const processosAtivos = apenado.processos || []

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setLocalPhone(formatted)
  }

  const handlePhoneBlur = () => {
    if (localPhone !== formatPhone(apenado.phone || '')) {
      updateField('phone', localPhone)
    }
  }

  const handleAddressChange = (e) => {
    setLocalAddress(e.target.value)
  }

  const handleAddressBlur = () => {
    if (localAddress !== (apenado.address || '')) {
      updateField('address', localAddress)
    }
  }

  const getMudancasLabels = () => {
    const labels = {
      phone: 'Telefone',
      address: 'Endereço',
      workingStatus: 'Situação Trabalhista',
    }
    return Object.entries(mudancas)
      .filter(([, m]) => m.mudou)
      .map(([field]) => labels[field])
      .join(', ')
  }

  const showPhone = isFieldVisible('phone')
  const showAddress = isFieldVisible('address')
  const showWorkingStatus = isFieldVisible('workingStatus')
  const hasAnyVisible = showPhone || showAddress || showWorkingStatus

  return (
    <div className="animate-in fade-in slide-in-from-top-4 space-y-4">
      {processosAtivos.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Processo Ativo</Label>
            <Select
              value={processo ? String(processo.id) : ''}
              onValueChange={(id) => {
                const proc = processosAtivos.find((p) => String(p.id) === id)
                if (proc) {
                  selectProcesso(proc)
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Selecione um processo" />
              </SelectTrigger>
              <SelectContent>
                {processosAtivos.map((processo) => (
                  <SelectItem key={processo.id} value={String(processo.id)}>
                    {processo.numeroProcesso || processo.numeroProcesso}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {processo && (
            <div className="bg-muted/50 space-y-2 rounded-lg p-4 text-sm wrap-break-word">
              <p>
                <span className="text-muted-foreground">Processo:</span>{' '}
                {processo.numeroProcesso || processo.numeroProcesso}
              </p>
              <p>
                <span className="text-muted-foreground">Situação:</span>{' '}
                {processo.tipoPena || processo.tipoPena}
              </p>
              {processo.institution && (
                <p>
                  <span className="text-muted-foreground">Instituição:</span> {processo.institution}
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

      {hasAnyEditable && (
        <div className="flex items-start gap-2 pt-2 md:items-center">
          <Checkbox
            id="enableEditing"
            checked={canEdit}
            onCheckedChange={toggleEdit}
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
      )}

      {hasAnyVisible && (
        <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
          {hasChanges && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Dados modificados</p>
                <p className="mt-1 text-xs">{getMudancasLabels()}</p>
              </div>
            </div>
          )}

          {showPhone && (
            <div className="space-y-1">
              <Label htmlFor="editPhone">Telefone</Label>
              <Input
                id="editPhone"
                name="phone"
                type="tel"
                key={`phone-${apenado?.id}`}
                disabled={!canEdit || !isFieldEditable('phone')}
                minLength={14}
                maxLength={15}
                pattern="^\(\d{2}\) \d{4,5}-\d{4}$"
                title="O telefone deve conter DDD e entre 8 a 9 números."
                placeholder="(00) 00000-0000"
                value={localPhone}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
              />
            </div>
          )}

          {showAddress && (
            <div className="space-y-1">
              <Label htmlFor="editAddress">Endereço</Label>
              <Input
                id="editAddress"
                name="address"
                key={`address-${apenado?.id}`}
                disabled={!canEdit || !isFieldEditable('address')}
                placeholder="Rua, número..."
                value={localAddress}
                onChange={handleAddressChange}
                onBlur={handleAddressBlur}
              />
            </div>
          )}

          {showWorkingStatus && (
            <div className="space-y-1">
              <Label>Situação Trabalhista</Label>
              <Select
                disabled={!canEdit || !isFieldEditable('workingStatus')}
                name="workingStatus"
                value={apenado.workingStatus || ''}
                onValueChange={(value) => updateField('workingStatus', value)}
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
              {!canEdit && hasAnyEditable && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  Marque a opcao acima para editar os dados antes de gerar o comprovante.
                </p>
              )}
            </div>
          )}

          {!hasAnyEditable && (
            <p className="text-muted-foreground text-center text-xs">
              Todos os campos estão em modo somente leitura conforme configuração do administrador.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
