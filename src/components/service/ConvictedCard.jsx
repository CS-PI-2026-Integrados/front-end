import { useMemo } from 'react'
import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label.jsx'
import { SelectConvicted } from './SelectConvicted.jsx'

export function ConvictedCard({
  className,
  atendimento,
  onChangeAtendimento,
  onMudancasDetectadas,
}) {
  const currentDateTime = useMemo(
    () =>
      new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    []
  )

  return (
    <Card className={cn('flex flex-col overflow-hidden rounded-xl shadow-sm', className)}>
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-4 pt-3 pb-1 md:px-6 md:pt-4 md:pb-2">
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Dados do Atendimento
        </CardTitle>
        <p className="text-muted-foreground text-sm">Selecione o apenado e registre a foto</p>
      </CardHeader>
      <CardContent
        className={cn(
          'flex flex-col px-4 pb-4 md:min-h-0 md:flex-1 md:px-6 md:pb-6',
          atendimento.apenado ? 'md:overflow-y-auto' : 'md:overflow-hidden'
        )}
      >
        <SelectConvicted
          atendimento={atendimento}
          onChangeAtendimento={onChangeAtendimento}
          onMudancasDetectadas={onMudancasDetectadas}
        />
        <div className="mt-auto shrink-0 space-y-2 pt-4 md:pt-6">
          <Label>Data e Hora</Label>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm font-medium">{currentDateTime}</p>
            <p className="text-muted-foreground mt-1 text-xs">Automático</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
