import { CheckCircle2, Download, Eye, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { useAttendancePhoto } from '../hooks/useAttendancePhoto'

export function ReceiptSuccessCard({
  className,
  receipt,
  convicted,
  process,
  onReset,
  onDownload,
  onView,
  isProcessing,
  error,
}) {
  const photo = useAttendancePhoto(receipt.id)
  return (
    <Card
      className={cn(
        'border-primary/20 flex flex-col gap-0 overflow-hidden rounded-xl py-0 shadow-sm',
        className
      )}
    >
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-primary h-5 w-5" aria-hidden="true" />
          <CardTitle className="text-lg font-semibold md:text-xl">Atendimento Finalizado</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">Presença registrada com sucesso</p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
        <div className="flex flex-1 flex-col items-center justify-center space-y-3 py-4">
          <div className="bg-primary/10 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            {photo.url ? (
              <img
                src={photo.url}
                alt="Foto do atendimento"
                className="h-full w-full rounded-xl object-contain"
              />
            ) : (
              <CheckCircle2 className="text-primary h-10 w-10" aria-hidden="true" />
            )}
          </div>
          {photo.isLoading && <p role="status">Carregando foto...</p>}
          {photo.error && <p className="text-destructive text-sm">{photo.error}</p>}
          <div className="w-full shrink-0 space-y-1 text-center">
            <p className="font-semibold">{convicted?.fullName || 'Apenado'}</p>
            <p className="text-sm font-medium">{process?.number || 'Sem Processo Vinculado'}</p>
            <p className="text-muted-foreground mt-1 font-mono text-xs break-all">
              Protocolo: {receipt.id}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              Consulte o comprovante para visualização e download.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-destructive text-center text-sm">
            {error} Tente consultar novamente sem registrar outro atendimento.
          </p>
        )}

        <div className="mt-auto w-full shrink-0 space-y-2 pt-3">
          <Button
            type="button"
            disabled={isProcessing}
            variant="outline"
            className="h-10 w-full bg-transparent"
            onClick={() => onView(receipt)}
          >
            <Eye className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
            Visualizar Comprovante
          </Button>

          <Button
            type="button"
            disabled={isProcessing}
            className="h-10 w-full"
            onClick={() => onDownload(receipt)}
          >
            <Download className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
            Baixar Comprovante (PDF)
          </Button>

          <Button
            type="button"
            disabled={isProcessing}
            variant="outline"
            className="h-10 w-full"
            onClick={onReset}
          >
            <PlusCircle className="mr-2 h-4 w-4 shrink-0" aria-hidden="true" />
            Novo Atendimento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
