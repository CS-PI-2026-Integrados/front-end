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

  const [apenadoSelecionado, setApenadoSelecionado] = useState(null)
  const [fotoAtendimento, setFotoAtendimento] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const isReadyToCapture = Boolean(
    atendimento.apenado && (atendimento.apenado.processos?.length === 0 || atendimento.processo)
  )

  const { generateReceipt } = useGenerateReceipt({
    setAtendimento,
  })

  const handleChangeAtendimento = (novoAtendimento) => {
    if (novoAtendimento.apenado?.id !== atendimento.apenado?.id) {
      setApenadoSelecionado(JSON.parse(JSON.stringify(novoAtendimento.apenado)))
      setErrorMessage('')
    }
    setAtendimento(novoAtendimento)
  }

  const resetForm = () => {
    setAtendimento({ apenado: null, processo: null })
    setApenadoSelecionado(null)
    setFotoAtendimento(null)
    setErrorMessage('')
  }

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!atendimento.apenado) {
      setErrorMessage('Selecione um apenado para continuar')
      return
    }
    if (!atendimento.processo && atendimento.apenado.processos?.length > 0) {
      setErrorMessage('Selecione um processo para continuar')
      return
    }
    if (!fotoAtendimento) {
      setErrorMessage('Capture ou selecione uma foto para gerar o comprovante')
      return
    }

    setIsSubmitting(true)
    try {
      const foiAlterado = JSON.stringify(atendimento.apenado) !== JSON.stringify(apenadoSelecionado)

      await generateReceipt({
        apenadoAtualizado: atendimento.apenado,
        processoAtivo: atendimento.processo,
        fotoAtendimento,
        foiAlterado,
      })
      resetForm()
    } catch (error) {
      console.error('Falha ao gerar comprovante:', error)
      setErrorMessage(error.message || 'Falha ao gerar comprovante. Tente novamente.')
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
        {errorMessage && (
          <div className="bg-destructive/10 border-destructive text-destructive mt-4 rounded-lg border p-3 text-sm">
            {errorMessage}
          </div>
        )}
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
              <form id="form-atendimento" onSubmit={handleFinalSubmit} className="contents">
                <ConvictedCard
                  className="w-full md:flex-1"
                  atendimento={atendimento}
                  onChangeAtendimento={handleChangeAtendimento}
                  isSubmitting={isSubmitting}
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
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Service
