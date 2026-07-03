import { useMemo } from 'react'
import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label.jsx'
import { SelectConvicted } from './SelectConvicted.jsx'
import { useService } from '@/context/ServiceContext'
import { FileText } from 'lucide-react'

export function ConvictedCard({ className }) {
  const { apenado } = useService()
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
      className={cn(
        'flex min-h-0 flex-col gap-0 overflow-hidden rounded-xl py-0 shadow-sm',
        className
      )}
    >
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Dados do Atendimento
        </CardTitle>
        <p className="text-muted-foreground text-sm">Selecione o apenado e registre a foto</p>
      </CardHeader>
      <CardContent
        className={cn('flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 md:px-6 md:pb-6')}
      >
        <SelectConvicted />

        {!apenado && (
          <div className="mt-4 flex min-h-[120px] flex-1 items-center justify-center md:mt-6">
            <div className="border-muted-foreground/25 flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8">
              <div className="bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full">
                <FileText className="text-muted-foreground/50 h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-center text-sm font-medium">
                Selecione um apenado para gerar o comprovante
              </p>
            </div>
          </div>
        )}

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
