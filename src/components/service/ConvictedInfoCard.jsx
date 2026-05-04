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

export function ConvictedInfoCard({ apenado, processoAtivo, onChangeProcesso, onFinalSubmit }) {
  const [canEdit, setCanEdit] = useState(false)

  const processos = apenado.processos || []

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const phone = formData.get('phone')
    const address = formData.get('address')
    const workStatus = formData.get('workStatus')

    const isPhoneChanged = phone !== (apenado.phone || '')
    const isAddressChanged = address !== (apenado.address || '')
    const isWorkStatusChanged = workStatus !== (apenado.workStatus || 'nao-trabalha')

    const foiAlterado = canEdit && (isPhoneChanged || isAddressChanged || isWorkStatusChanged)
    const apenadoAtualizado = { ...apenado, phone, address, workStatus }

    if (onFinalSubmit) {
      onFinalSubmit({ apenadoAtualizado, foiAlterado, processoAtivo })
    }
  }

  return (
    <form
      id="form-atendimento"
      onSubmit={handleSubmit}
      className="animate-in fade-in slide-in-from-top-4 space-y-4"
    >
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
            disabled={!canEdit}
            placeholder="(00) 00000-0000"
            defaultValue={apenado.phone}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="editAddress">Endereço</Label>
          <Input
            id="editAddress"
            name="address"
            disabled={!canEdit}
            placeholder="Rua, número..."
            defaultValue={apenado.address}
          />
        </div>

        <div className="space-y-2">
          <Label>Situação Trabalhista</Label>
          <Select
            disabled={!canEdit}
            defaultValue={apenado.workStatus || 'nao-trabalha'}
            name="workStatus"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trabalha">Trabalha</SelectItem>
              <SelectItem value="nao-trabalha">Não Trabalha</SelectItem>
              <SelectItem value="autonomo">Autônomo</SelectItem>
            </SelectContent>
          </Select>
          {!canEdit && (
            <p className="text-muted-foreground text-xs leading-relaxed">
              Marque a opcao acima para editar os dados antes de gerar o comprovante.
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
