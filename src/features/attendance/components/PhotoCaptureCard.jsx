import { useMemo, useEffect } from 'react'
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
  const preview = useMemo(() => {
    if (!file) return null
    return typeof file === 'string' ? file : URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (preview && typeof file !== 'string') {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview, file])

  return (
    <Card
      className={cn(
        'flex flex-col gap-0 overflow-hidden rounded-xl py-0 shadow-sm',
        (!isReadyToCapture || isSubmitting) && 'ring-foreground/5',
        className
      )}
    >
      <CardHeader
        className={cn(
          'shrink-0 flex-col items-start space-y-1 px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4',
          !isReadyToCapture && 'opacity-40'
        )}
      >
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Captura de Foto
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          A foto do atendimento é obrigatória para emissão do comprovante
        </p>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6">
        {preview ? (
          <div className="flex w-full shrink-0 flex-col items-center justify-center gap-6 pb-4 lg:flex-row lg:flex-wrap lg:items-start">
            {referencePhotoUrl && (
              <div className="flex shrink-0 flex-col items-center space-y-2 lg:flex-1">
                <p className="text-muted-foreground shrink-0 text-center text-xs font-medium">
                  Foto de Referência
                </p>
                <div className="bg-muted/40 relative mx-auto flex aspect-square w-full max-w-40 shrink-0 overflow-hidden rounded-xl border shadow-md lg:max-w-[200px]">
                  <img
                    src={referencePhotoUrl}
                    alt="Foto de Referência"
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
              </div>
            )}
            <div className="flex shrink-0 flex-col items-center space-y-2 lg:flex-1">
              <p className="text-muted-foreground shrink-0 text-center text-xs font-medium">
                Foto Atual
              </p>
              <div className="bg-muted/40 relative mx-auto flex aspect-square w-full max-w-40 shrink-0 overflow-hidden rounded-xl border shadow-md lg:max-w-[200px]">
                <img
                  src={preview}
                  alt="Foto Atual"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <CameraCapture
            file={file}
            onCapture={onCapture}
            onClear={onClear}
            deviceId={deviceId}
            disabled={isSubmitting || !isReadyToCapture}
            onError={onError}
          />
        )}

        {error && (
          <p role="alert" className="text-destructive text-center text-sm font-medium">
            {error}
          </p>
        )}

        <div className="mt-auto shrink-0 space-y-2 pt-4">
          {!file && !isSubmitting && isReadyToCapture && (
            <p className="text-muted-foreground text-center text-xs">
              Tire ou envie uma foto para continuar
            </p>
          )}
          {file && !isReadyToCapture && (
            <p className="text-muted-foreground text-center text-xs">
              Selecione um apenado e um processo ativo para continuar
            </p>
          )}

          <div className="flex flex-col gap-2">
            <SubmitButton isLoading={isSubmitting} loadingLabel="Confirmando presença...">
              Gerar Comprovante
            </SubmitButton>
            {file && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onClear}
                disabled={isSubmitting}
              >
                Descartar Foto
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
