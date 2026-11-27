import { CircleMinus, CirclePlus, Pencil } from 'lucide-react'
import { useId } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { ConvictedCpf } from './ConvictedCpf'
import {
  formatAddress,
  getConvictedStatusLabel,
  getEmploymentStatusLabel,
} from '../utils/convictedUtils'

export function ConvictedProfileDetails({ convicted, onEdit, onChangeStatus }) {
  const processesHeadingId = useId()
  const inactive = convicted.status === 'INACTIVE'
  const fields = [
    { label: 'Data de nascimento', value: convicted.birthDate },
    { label: 'Telefone', value: convicted.phone },
    {
      label: 'Situação de trabalho',
      value: convicted.employmentStatus && getEmploymentStatusLabel(convicted.employmentStatus),
    },
    { label: 'Endereço', value: formatAddress(convicted.address) },
  ]

  return (
    <Card size="sm">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Dados do apenado</h2>
        <div className="flex flex-wrap gap-2">
          {!inactive && (
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              <Pencil /> Editar
            </Button>
          )}
          <Button type="button" variant="ghost" size="sm" onClick={onChangeStatus}>
            {inactive ? <CirclePlus /> : <CircleMinus className="text-destructive" />}
            {inactive ? 'Ativar' : 'Inativar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ConvictedCpf convictedId={convicted.id} maskedCpf={convicted.cpf} />
        <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
          {fields.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-muted-foreground text-xs font-semibold">{label}</dt>
              <dd className="mt-1 wrap-break-word">{value || 'Sem informação'}</dd>
            </div>
          ))}
        </dl>
        <section className="border-border space-y-2 border-t pt-3">
          <h3 id={processesHeadingId} className="font-semibold">
            Processos vinculados
          </h3>
          {convicted.processes.length ? (
            <ul
              aria-labelledby={processesHeadingId}
              tabIndex={0}
              className="focus-visible:outline-ring max-h-24 space-y-2 overflow-y-auto rounded-md [scrollbar-gutter:stable] focus-visible:outline-2"
            >
              {convicted.processes.map((process) => (
                <li
                  key={process.id}
                  className="bg-muted/50 flex flex-wrap items-center justify-between gap-2 rounded-lg p-3"
                >
                  <span className="min-w-0 wrap-break-word">{process.number}</span>
                  <span className="text-muted-foreground">
                    {process.principal ? 'Principal · ' : ''}
                    {getConvictedStatusLabel(process.status)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              {convicted.noProcessDeclared
                ? 'Ausência de processo declarada.'
                : 'Nenhum processo vinculado.'}
            </p>
          )}
        </section>
      </CardContent>
    </Card>
  )
}
