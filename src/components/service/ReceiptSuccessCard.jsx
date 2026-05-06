import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { CheckCircle2, Download, Eye, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export function ReceiptSuccessCard({ className, atendimento, onReset }) {
  return (
    <Card
      className={cn(
        'border-primary/20 flex flex-col overflow-hidden rounded-xl shadow-sm',
        className
      )}
    >
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-4 pt-3 pb-1 md:px-6 md:pt-4 md:pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-primary h-5 w-5" />
          <CardTitle className="text-lg font-semibold md:text-xl">Atendimento Finalizado</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">Comprovante de presença gerado com sucesso</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 md:px-6 md:pb-6">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center space-y-4">
          <div className="bg-primary/10 flex shrink-0 items-center justify-center rounded-full p-4">
            <img></img>
          </div>
          <div className="shrink-0 space-y-1 text-center">
            <p className="font-semibold">{atendimento.apenado?.fullName || 'Apenado'}</p>
            <p className="font-sm">{atendimento.processo?.processNumber || 'Apenado'}</p>
            <p className="text-muted-foreground text-sm">
              O documento já está disponível para visualização e download.
            </p>
          </div>
        </div>

        <div className="w-full shrink-0 space-y-3 pt-4">
          <Button type="button" variant="outline" className="h-10 w-full bg-transparent">
            <Eye className="mr-2 h-4 w-4 shrink-0" />
            Visualizar Comprovante
          </Button>

          <Button type="button" className="h-10 w-full">
            <Download className="mr-2 h-4 w-4 shrink-0" />
            Baixar Comprovante (PDF)
          </Button>
        </div>

        <div className="mt-2 shrink-0 pt-4">
          <Button type="button" variant="ghost" className="h-10 w-full" onClick={onReset}>
            <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
            Novo Atendimento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
