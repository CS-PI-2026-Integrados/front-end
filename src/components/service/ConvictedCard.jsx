import { useMemo } from 'react'
import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
    <Card
      className={cn('flex flex-col gap-4 rounded-xl py-4 shadow-sm md:gap-6 md:py-6', className)}
    >
      <CardHeader className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-4 pb-0 md:px-6">
        <CardTitle className="text-lg leading-none font-semibold md:text-xl">
          Dados do Atendimento
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Selecione o apenado e registre a foto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-0 md:space-y-6 md:px-6">
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
