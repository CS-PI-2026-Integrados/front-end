import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SelectConvicted } from './SelectConvicted.jsx'

export function ConvictedCard({ className }) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="flex-column items-center space-y-0 pb-2">
        <CardTitle className="font-bold">Dados do atendimento</CardTitle>
        <p className="text-muted-foreground">Selecione o apenado e registre a foto</p>
      </CardHeader>
      <CardContent className="flex-column w-full items-center">
        <SelectConvicted></SelectConvicted>
      </CardContent>
    </Card>
  )
}
