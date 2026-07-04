import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button.jsx'
import { Camera, Loader2, Upload, X } from 'lucide-react'
import { usePhotoCaptureCard } from '@/hooks/usePhotoCaptureCard.js'
import { Label } from '@/components/ui/label.jsx'
import { useService } from '@/context/ServiceContext'

export function PhotoCaptureCard({ className }) {
  const {
    fotoAtendimento,
    apenado,
    isReadyToCapture,
    isSubmitting,
    setFoto,
    setPhotoStreaming,
    setPhotoError,
    clearPhoto,
  } = useService()

  const {
    preview,
    isStreaming: _,
    videoRef,
    fileInputRef,
    handleFileChange,
    discardPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    openFileDialog,
  } = usePhotoCaptureCard({
    photo: fotoAtendimento.data,
    isStreaming: fotoAtendimento.isStreaming,
    setFoto,
    setPhotoStreaming,
    setPhotoError,
    clearPhoto,
  })

  const isStreaming = fotoAtendimento.isStreaming
  const error = fotoAtendimento.error

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
        {preview ? (
          <div className="flex w-full shrink-0 flex-col items-center justify-center gap-6 pb-4 lg:flex-row lg:flex-wrap lg:items-start">
            {apenado && (
              <div className="flex shrink-0 flex-col items-center space-y-2 lg:flex-1">
                <p className="text-muted-foreground shrink-0 text-center text-xs font-medium">
                  Foto de Referência
                </p>
                <div className="relative mx-auto flex aspect-[3/4] w-full max-w-[160px] shrink-0 overflow-hidden rounded-xl border shadow-2xl lg:max-w-[200px]">
                  <img
                    src={apenado.referencePhotoUrl || ''}
                    alt="Referência"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
            <div className="flex shrink-0 flex-col items-center space-y-2 lg:flex-1">
              <p className="text-primary shrink-0 text-center text-xs font-medium">Foto Atual</p>
              <div className="ring-primary/30 relative mx-auto flex aspect-[3/4] w-full max-w-[160px] shrink-0 overflow-hidden rounded-xl border shadow-2xl ring-4 lg:max-w-[200px]">
                <img
                  src={preview}
                  alt="Preview do Apenado"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        ) : isStreaming ? (
          <div className="flex shrink-0 flex-col items-center justify-center space-y-4 pb-2">
            <div className="relative mx-auto flex aspect-[3/4] w-full max-w-[280px] shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-black shadow-2xl md:max-w-[320px]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
                onClick={stopCamera}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex shrink-0 items-center justify-center">
              <button
                type="button"
                onClick={takePhoto}
                className="group border-muted-foreground/30 bg-muted/50 relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] transition-transform hover:scale-105 active:scale-95"
                title="Tirar Foto"
              >
                <div className="bg-primary text-primary-foreground group-active:bg-primary/80 flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-colors">
                  <Camera className="h-6 w-6" />
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex w-full shrink-0 flex-col items-center justify-center pb-2">
            <div className="w-full max-w-sm space-y-3">
              <div className="space-y-1">
                <Label className="pointer-events-none invisible opacity-0 select-none">Ação</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full bg-transparent whitespace-normal"
                  onClick={startCamera}
                >
                  <Camera className="mr-2 h-4 w-4 shrink-0" />
                  <span className="text-left">Iniciar Captura</span>
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                className="bg-background h-10 w-full whitespace-normal"
                onClick={openFileDialog}
              >
                <Upload className="mr-2 h-4 w-4 shrink-0" />
                <span className="text-left">Upload de Foto (Galeria)</span>
              </Button>

              <input
                accept="image/*"
                className="hidden"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <p className="text-muted-foreground text-center text-xs">
                Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
              </p>
              {error && <p className="text-destructive text-center text-sm">{error}</p>}
            </div>
          </div>
        )}

        <div className="mt-auto shrink-0 space-y-2 pt-4">
          {!preview && !isSubmitting && isReadyToCapture && (
            <p className="text-muted-foreground text-center text-xs">
              Tire ou envie uma foto para continuar
            </p>
          )}
          {preview && !isReadyToCapture && (
            <p className="text-muted-foreground text-center text-xs">
              Selecione um apenado e processo (se houver) para gerar
            </p>
          )}

          {preview ? (
            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={!isReadyToCapture || isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirmando Presença...
                  </>
                ) : (
                  'Confirmar Presença'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={discardPhoto}
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
