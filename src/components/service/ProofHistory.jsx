import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'

export function ProofHistory({ comprovantes }) {
  if (!comprovantes || !Array.isArray(comprovantes)) return null

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-4 pt-3 pb-1 md:px-6 md:pt-4 md:pb-2">
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Histórico de Comprovantes
        </CardTitle>
        <p className="text-muted-foreground text-sm">Veja os comprovantes gerados anteriormente</p>
      </CardHeader>
      <CardContent className="flex flex-col px-4 pb-4 md:min-h-0 md:flex-1 md:px-6 md:pb-6"></CardContent>
    </Card>
  )
}
