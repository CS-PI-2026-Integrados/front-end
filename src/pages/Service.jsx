import { useState } from 'react'
import { ConvictedCard } from '@/components/service/ConvictedCard.jsx'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs.jsx'
import { PhotoCaptureCard } from '@/components/service/PhotoCaptureCard.jsx'
import { useGenerateReceipt } from '@/hooks/useGenerateReceipt.js'

const Service = () => {
  const [atendimento, setAtendimento] = useState({
    apenado: null,
    processo: null,
  })

  const [fotoAtendimento, setFotoAtendimento] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isReadyToCapture = Boolean(
    atendimento.apenado && (atendimento.apenado.processos?.length === 0 || atendimento.processo)
  )

  const { generateReceipt } = useGenerateReceipt({
    setAtendimento,
    fotoAtendimento,
  })

  const handleFinalSubmit = async (params) => {
    setIsSubmitting(true)
    try {
      await generateReceipt(params)
      setTimeout(() => {
        setAtendimento({ apenado: null, processo: null })
        setFotoAtendimento(null)
      }, 300)
    } catch (error) {
      console.error('Falha ao gerar comprovante:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Emissão de Comprovantes</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Gere comprovantes de comparecimento com foto
          </p>
        </div>
        <div className="py-3">
          <Tabs defaultValue="novo" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2 md:inline-flex md:w-auto">
              <TabsTrigger value="novo">Novo comprovante</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent
              value="novo"
              className="flex w-full flex-col items-start gap-6 md:flex-row"
            >
              <ConvictedCard
                className="w-full md:flex-1"
                atendimento={atendimento}
                onChangeAtendimento={setAtendimento}
                isSubmitting={isSubmitting}
                onFinalSubmit={handleFinalSubmit}
              />
              <div
                className={`w-full transition-all duration-300 md:flex-1 ${
                  !isReadyToCapture ? 'pointer-events-none opacity-40 grayscale-[0.5]' : ''
                }`}
              >
                <PhotoCaptureCard
                  isReady={isReadyToCapture}
                  isSubmitting={isSubmitting}
                  photo={fotoAtendimento}
                  onPhotoSelect={setFotoAtendimento}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Service
