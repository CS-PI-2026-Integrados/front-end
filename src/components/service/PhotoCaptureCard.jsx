import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { cn } from '@/lib/utils.js'
import { Button } from '@/components/ui/button.jsx'
import { Camera, Upload } from 'lucide-react'

export function PhotoCaptureCard({ className }) {
  return (
    <Card className={cn('flex flex-col shadow-sm', className)}>
      <CardHeader className="flex-col items-start space-y-1 pb-4 md:items-center">
        <CardTitle className="text-lg font-semibold md:text-xl">Captura de Foto</CardTitle>
        <p className="text-muted-foreground text-left text-sm md:text-center">
          A foto é obrigatória para emissão do comprovante
        </p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-end space-y-4 px-6">
        <div className="space-y-3">
          <Button variant="outline" className="h-auto w-full bg-transparent py-2 whitespace-normal">
            <Camera className="mr-2 h-4 w-4 shrink-0" />
            <span className="text-left">Capturar com Câmera Externa</span>
          </Button>

          <Button variant="outline" className="bg-background h-auto w-full py-2 whitespace-normal">
            <Upload className="mr-2 h-4 w-4 shrink-0" />
            <span className="text-left">Upload de Foto</span>
          </Button>

          <input accept="image/*" className="hidden" type="file" />

          <p className="text-muted-foreground text-center text-xs">
            Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB
          </p>
        </div>

        <div className="mt-auto pt-4">
          <Button type="submit" form="form-atendimento" className="w-full">
            Gerar Comprovante
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
