import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button.jsx'
import { Camera, Loader2, Upload, X } from 'lucide-react'
import { usePhotoCaptureCard } from '@/hooks/usePhotoCaptureCard.js'

export function PhotoCaptureCard({ className, isReady, isSubmitting, photo, onPhotoSelect }) {
  const {
    error,
    preview,
    isStreaming,
    videoRef,
    fileInputRef,
    handleFileChange,
    clearPhoto,
    startCamera,
    stopCamera,
    takePhoto,
    openFileDialog,
  } = usePhotoCaptureCard({ photo, onPhotoSelect })

  return (
    <Card className={cn('flex flex-col shadow-sm', className)}>
      <CardHeader className="flex-col items-start space-y-1 pb-4 md:items-center">
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Captura de Foto
        </CardTitle>
        <p className="text-muted-foreground text-left text-sm md:text-center">
          A foto é obrigatória para emissão do comprovante
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end space-y-4 px-6">
        {preview ? (
          <div className="relative mx-auto w-full max-w-[200px] overflow-hidden rounded-md border shadow-sm">
            <img
              src={preview}
              alt="Preview do Apenado"
              className="aspect-[3/4] h-auto w-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md"
              onClick={clearPhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : isStreaming ? (
          <div className="space-y-4">
            <div className="relative mx-auto w-full max-w-[200px] overflow-hidden rounded-md border bg-black shadow-sm">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="aspect-[3/4] h-auto w-full scale-x-[-1] object-cover"
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
            <Button type="button" className="w-full" onClick={takePhoto}>
              <Camera className="mr-2 h-4 w-4 shrink-0" />
              Tirar Foto
            </Button>
          </div>
        ) : (
          <>
            {error && <p className="text-destructive text-center text-sm">{error}</p>}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="h-auto w-full bg-transparent py-2 whitespace-normal"
                onClick={startCamera}
              >
                <Camera className="mr-2 h-4 w-4 shrink-0" />
                <span className="text-left">Iniciar Captura</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                className="bg-background h-auto w-full py-2 whitespace-normal"
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
            </div>
          </>
        )}

        <div className="mt-auto space-y-2 pt-4">
          {!preview && !isSubmitting && isReady && (
            <p className="text-muted-foreground text-center text-xs">
              Tire ou envie uma foto para continuar
            </p>
          )}
          {preview && !isReady && (
            <p className="text-muted-foreground text-center text-xs">
              Selecione um apenado e processo (se houver) para gerar
            </p>
          )}
          <Button type="submit" className="w-full" disabled={!preview || !isReady || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              'Gerar Comprovante'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
