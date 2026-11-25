import { useId, useState } from 'react'
import { Day } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import { Button } from '@/shared/components/ui/button'
import { Calendar } from '@/shared/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import { useConvictedSchedule } from '../hooks/useConvictedSchedule'

const groupOrigin = 'REFLECTION_GROUP'
const individualOrigin = 'INDIVIDUAL_APPEARANCE'
const districtMonth = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: 'numeric',
})
const dayLabel = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' })

function currentMonth() {
  const parts = districtMonth.formatToParts(new Date())
  const year = Number(parts.find(({ type }) => type === 'year').value)
  const month = Number(parts.find(({ type }) => type === 'month').value)
  return new Date(year, month - 1, 1)
}

function civilDate(day) {
  const year = String(day.getFullYear()).padStart(4, '0')
  const month = String(day.getMonth() + 1).padStart(2, '0')
  const date = String(day.getDate()).padStart(2, '0')
  return `${year}-${month}-${date}`
}

function OriginMarker({ group }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block size-1.5 shrink-0',
        group ? 'bg-primary rounded-full' : 'border-foreground rounded-[1px] border'
      )}
    />
  )
}

function AgendaDay({ children, modifiers, ...props }) {
  const { group, individual, hidden } = modifiers
  const showMarkers = !hidden && (group || individual)
  const description = [group && 'Grupo reflexivo', individual && 'Comparecimento individual']
    .filter(Boolean)
    .join(' e ')
  const label = props['aria-label']

  return (
    <Day
      {...props}
      modifiers={modifiers}
      aria-label={showMarkers ? `${label}, ${description}` : label}
    >
      {children}
      {showMarkers && (
        <span className="absolute inset-x-0 bottom-0.5 flex justify-center gap-0.5">
          {group && <OriginMarker group />}
          {individual && <OriginMarker />}
        </span>
      )}
    </Day>
  )
}

export function ConvictedSchedule({ convictedId }) {
  const headingId = useId()
  const [month, setMonth] = useState(currentMonth)
  const from = civilDate(new Date(month.getFullYear(), month.getMonth(), 1))
  const to = civilDate(new Date(month.getFullYear(), month.getMonth() + 1, 1))
  const { events, isLoading, error, retry } = useConvictedSchedule(convictedId, from, to)
  const groupDates = new Set()
  const individualDates = new Set()

  events.forEach(({ origin, date, status }) => {
    if (status !== 'SCHEDULED') return
    if (origin === groupOrigin) groupDates.add(date)
    if (origin === individualOrigin) individualDates.add(date)
  })

  return (
    <Card role="region" aria-labelledby={headingId} size="sm" className="relative">
      <CardHeader>
        <h2 id={headingId} className="text-lg font-semibold">
          Agenda
        </h2>
      </CardHeader>
      <CardContent className="space-y-1">
        <Calendar
          locale={ptBR}
          month={month}
          onMonthChange={setMonth}
          fixedWeeks
          showOutsideDays={false}
          className={cn('mx-auto w-full max-w-60 p-0', error && '[&_[role=grid]]:invisible')}
          classNames={{
            month: 'flex w-full flex-col gap-1',
            week: 'mt-0.5 flex w-full',
            day: 'relative flex h-6.5 min-w-0 flex-1 items-start justify-center rounded-md pt-0.5 text-xs select-none',
          }}
          labels={{
            labelNav: () => 'Navegação da agenda',
            labelPrevious: () => 'Mês anterior',
            labelNext: () => 'Próximo mês',
            labelGridcell: (day) => dayLabel.format(day),
          }}
          modifiers={{
            group: (day) => groupDates.has(civilDate(day)),
            individual: (day) => individualDates.has(civilDate(day)),
          }}
          components={{ Day: AgendaDay }}
        />
        <ul
          aria-label="Legenda da agenda"
          className={cn('text-muted-foreground space-y-1 text-xs', error && 'invisible')}
        >
          <li className="flex items-center gap-2">
            <OriginMarker group /> Grupo reflexivo
          </li>
          <li className="flex items-center gap-2">
            <OriginMarker /> Comparecimento individual
          </li>
        </ul>
        <div className="text-muted-foreground min-h-5">
          {isLoading && <p role="status">Carregando agenda…</p>}
          {!isLoading && !error && !groupDates.size && !individualDates.size && (
            <p role="status">Nenhum evento neste mês.</p>
          )}
        </div>
      </CardContent>
      {error && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
          <p role="alert" className="text-destructive font-medium">
            Agenda indisponível.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="pointer-events-auto"
            onClick={retry}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </Card>
  )
}
