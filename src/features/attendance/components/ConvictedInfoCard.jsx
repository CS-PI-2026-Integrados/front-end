import { Pencil } from 'lucide-react'
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
import { useAtendimento } from '../context/attendanceContext'
import { ReceiptAddressField } from './ReceiptAddressField'

export function ConvictedInfoCard({ disabled = false, errors = {} }) {
  const {
    convicted,
    process,
    selectProcess,
    canEdit,
    setCanEdit,
    updateField,
    setAddressError,
    hasSubmitted,
  } = useAtendimento()
  if (!convicted) return null
  const processes = convicted.processes.filter((item) => item.status === 'ACTIVE')
  const statusLabel = { ACTIVE: 'Ativo', INACTIVE: 'Inativo' }[convicted.status]
  const phone = (convicted.phone || '').replace(/^(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="attendance-process">Processo Ativo</Label>
        <Select
          disabled={disabled}
          value={process?.id || ''}
          onValueChange={(id) => selectProcess(processes.find((item) => item.id === id))}
        >
          <SelectTrigger
            id="attendance-process"
            className="w-full"
            aria-invalid={errors.processId ? true : undefined}
            aria-describedby={errors.processId ? 'attendance-process-error' : undefined}
          >
            <SelectValue placeholder="Selecione um processo ativo" />
          </SelectTrigger>
          <SelectContent>
            {processes.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.processId && (
          <p id="attendance-process-error" role="alert" className="text-destructive text-xs">
            {errors.processId}
          </p>
        )}
      </div>
      {!processes.length && <p className="text-destructive">Nenhum processo ativo vinculado.</p>}
      <div className="bg-muted rounded-md px-3 py-2.5">
        <p>
          <span className="text-muted-foreground">Processo:</span>{' '}
          {process?.number || 'Não informado'}
        </p>
        <p>
          <span className="text-muted-foreground">Situação:</span> {statusLabel || 'Não informada'}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="edit-attendance"
          checked={canEdit}
          disabled={disabled}
          onCheckedChange={(checked) => setCanEdit(Boolean(checked))}
        />
        <Label htmlFor="edit-attendance" className="font-normal">
          <Pencil className="size-3.5 shrink-0" aria-hidden="true" />
          Habilitar edição dos dados para este comprovante
        </Label>
      </div>
      <div className="bg-muted/30 space-y-3 rounded-md border p-4">
        <div className="space-y-1.5">
          <Label htmlFor="attendance-phone">Telefone</Label>
          <Input
            id="attendance-phone"
            type="tel"
            value={phone}
            maxLength={15}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? 'attendance-phone-error' : undefined}
            disabled={disabled || !canEdit}
            onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, ''))}
          />
          {errors.phone && (
            <p id="attendance-phone-error" role="alert" className="text-destructive text-xs">
              {errors.phone}
            </p>
          )}
        </div>
        <ReceiptAddressField
          key={convicted.id}
          address={convicted.address}
          disabled={disabled || !canEdit}
          onChange={(address) => updateField('address', address)}
          onError={setAddressError}
          error={errors.address}
          showErrors={hasSubmitted}
        />
        <div className="space-y-1.5">
          <Label htmlFor="attendance-employment">Situação Trabalhista</Label>
          <Select
            disabled={disabled || !canEdit}
            value={convicted.employmentStatus || ''}
            onValueChange={(value) => updateField('employmentStatus', value)}
          >
            <SelectTrigger
              id="attendance-employment"
              className="w-full"
              aria-invalid={errors.employmentStatus ? true : undefined}
              aria-describedby={errors.employmentStatus ? 'attendance-employment-error' : undefined}
            >
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FORMAL_WORK">Trabalho Registrado</SelectItem>
              <SelectItem value="INFORMAL_WORK">Trabalho Informal</SelectItem>
              <SelectItem value="UNEMPLOYED">Não Trabalha</SelectItem>
            </SelectContent>
          </Select>
          {errors.employmentStatus && (
            <p id="attendance-employment-error" role="alert" className="text-destructive text-xs">
              {errors.employmentStatus}
            </p>
          )}
        </div>
        <p className="text-muted-foreground text-xs">
          Marque a opção acima para editar os dados antes de gerar o comprovante.
        </p>
      </div>
    </div>
  )
}
