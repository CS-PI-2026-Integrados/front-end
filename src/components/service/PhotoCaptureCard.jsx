import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button.jsx'
import { Camera, Upload, X } from 'lucide-react'

export function PhotoCaptureCard({ className, onPhotoSelect }) {
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setPreview(imageUrl)

      if (onPhotoSelect) onPhotoSelect(file)
    }
  }

  const clearPhoto = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
    if (onPhotoSelect) onPhotoSelect(null)
  }

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
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full bg-transparent py-2 whitespace-normal"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera className="mr-2 h-4 w-4 shrink-0" />
              <span className="text-left">Capturar com Câmera (Celular)</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="bg-background h-auto w-full py-2 whitespace-normal"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4 shrink-0" />
              <span className="text-left">Upload de Foto (Galeria)</span>
            </Button>

            <input
              accept="image/*"
              capture="environment"
              className="hidden"
              type="file"
              ref={cameraInputRef}
              onChange={handleFileChange}
            />
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
        )}

        <div className="mt-auto pt-4">
          <Button type="submit" form="form-atendimento" className="w-full" disabled={!preview}>
            Gerar Comprovante
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
