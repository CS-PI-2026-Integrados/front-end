import { useMemo } from 'react'
import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label.jsx'
import { SelectConvicted } from './SelectConvicted.jsx'

export function ConvictedCard({ className, atendimento, onChangeAtendimento }) {
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
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-4 pt-4 pb-4 md:px-6 md:pt-6">
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Dados do Atendimento
        </CardTitle>
        <p className="text-muted-foreground text-sm">Selecione o apenado e registre a foto</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto px-4 pb-4 md:space-y-6 md:px-6 md:pb-6">
        <SelectConvicted atendimento={atendimento} onChangeAtendimento={onChangeAtendimento} />
        <div className="space-y-2">
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
