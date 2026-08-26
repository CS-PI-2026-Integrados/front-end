import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { CameraCapture } from '@/shared/components/CameraCapture'
import { SubmitButton } from '@/shared/components/buttons/SubmitButton'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

export function PhotoCaptureCard({
  className,
  file,
  referencePhotoUrl,
  deviceId,
  isReadyToCapture,
  isSubmitting,
  error,
  onCapture,
  onClear,
  onError,
}) {
  return (
    <Card
      className={cn('flex flex-col gap-0 overflow-hidden rounded-xl py-0 shadow-sm', className)}
    >
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Captura de Foto
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          A foto é obrigatória para emissão do comprovante
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 md:min-h-0 md:flex-1 md:px-6 md:pb-6">
        {referencePhotoUrl && file && (
          <img
            src={referencePhotoUrl}
            alt="Referência"
            className="mx-auto aspect-3/4 w-28 rounded-xl border object-cover"
          />
        )}
        <CameraCapture
          file={file}
          onCapture={onCapture}
          onClear={onClear}
          deviceId={deviceId}
          disabled={isSubmitting}
          onError={onError}
        />
        {error && <p className="text-destructive text-center text-sm">{error}</p>}

        <div className="mt-auto shrink-0 space-y-2 pt-4">
          {!file && !isSubmitting && isReadyToCapture && (
            <p className="text-muted-foreground text-center text-xs">
              Tire ou envie uma foto para continuar
            </p>
          )}
          {file && !isReadyToCapture && (
            <p className="text-muted-foreground text-center text-xs">
              Selecione um apenado e processo (se houver) para gerar
            </p>
          )}

          {file ? (
            <div className="flex flex-col gap-2">
              <SubmitButton
                disabled={!isReadyToCapture}
                isLoading={isSubmitting}
                loadingLabel="Confirmando presença..."
              >
                Confirmar presença
              </SubmitButton>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClear}
                disabled={isSubmitting}
              >
                Descartar Foto
              </Button>
            </div>
          ) : (
            <Button type="submit" className="w-full" disabled={true}>
              Gerar Comprovante
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
