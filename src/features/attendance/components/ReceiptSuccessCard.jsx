import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card.jsx'
import { Button } from '@/shared/components/ui/button.jsx'
import { CheckCircle2, Download, Eye, PlusCircle } from 'lucide-react'
import { cn } from '@/shared/lib/utils.js'

export function ReceiptSuccessCard({ className, atendimento, onReset, onDownload, onView }) {
  return (
    <Card
      className={cn(
        'border-primary/20 flex flex-col gap-0 overflow-hidden rounded-xl py-0 shadow-sm',
        className
      )}
    >
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-primary h-5 w-5" />
          <CardTitle className="text-lg font-semibold md:text-xl">Atendimento Finalizado</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">Comprovante de presença gerado com sucesso</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
        <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-4">
          <div className="bg-primary/10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            {atendimento.recibo?.photoUrl ? (
              <img
                src={atendimento.recibo.photoUrl}
                alt="Foto do Atendimento"
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              <CheckCircle2 className="text-primary h-10 w-10" />
            )}
          </div>
          <div className="shrink-0 space-y-1 text-center">
            <p className="font-semibold">{atendimento.apenado?.fullName || 'Apenado'}</p>
            <p className="text-sm font-medium">
              {atendimento.processo?.processNumber || 'Sem Processo Vinculado'}
            </p>
            {atendimento.recibo?.codigoVerificacao && (
              <p className="text-muted-foreground mt-1 font-mono text-xs">
                Protocolo: {atendimento.recibo.codigoVerificacao}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-sm">
              O documento já está disponível para visualização e download.
            </p>
          </div>
        </div>

        <div className="mt-auto w-full shrink-0 space-y-2 pt-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full bg-transparent"
            onClick={() => onView(atendimento)}
          >
            <Eye className="mr-2 h-4 w-4 shrink-0" />
            Visualizar Comprovante
          </Button>

          <Button type="button" className="h-10 w-full" onClick={() => onDownload(atendimento)}>
            <Download className="mr-2 h-4 w-4 shrink-0" />
            Baixar Comprovante (PDF)
          </Button>

          <Button type="button" variant="ghost" className="h-10 w-full" onClick={onReset}>
            <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
            Novo Atendimento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
