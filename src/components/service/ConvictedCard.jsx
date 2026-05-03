import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SelectConvicted } from './SelectConvicted.jsx'

export function ConvictedCard({ className }) {
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
        <SelectConvicted></SelectConvicted>
      </CardContent>
    </Card>
  )
}
