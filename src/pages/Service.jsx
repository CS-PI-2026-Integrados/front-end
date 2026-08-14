import { ConvictedCard } from '@/components/service/ConvictedCard.jsx'
import { useAtendimento } from '@/features/atendimento'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/shared/ui/tabs.jsx'
import { PhotoCaptureCard } from '@/components/service/PhotoCaptureCard.jsx'
import { ProofHistory } from '@/components/service/ProofHistory.jsx'
import { useGenerateReceipt } from '@/hooks/useGenerateReceipt.js'
import { useDistrictData } from '@/hooks/useDistrictData.js'
import { ReceiptSuccessCard } from '@/components/service/ReceiptSuccessCard.jsx'
import { getMudancasAtivas } from '@/features/atendimento/model/atendimentoUtils'

const Service = () => {
  const {
    apenado,
    processo,
    fotoAtendimento,
    isSuccess,
    mudancas,
    isReadyToCapture,
    reciboGerado,
    setSubmitting,
    setSuccess,
    setReciboGerado,
    setError,
    resetAtendimento,
  } = useAtendimento()

  const { presencas } = useDistrictData()

  const { generateReceipt } = useGenerateReceipt()

  const handleFinalSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!apenado) {
      setError('Selecione um apenado para continuar')
      return
    }

    const temProcessosAtivos = (apenado.processos || []).length > 0
    if (!processo && temProcessosAtivos) {
      setError('Selecione um processo para continuar')
      return
    }

    if (!fotoAtendimento) {
      setError('Capture ou selecione uma foto para gerar o comprovante')
      return
    }

    setSubmitting(true)
    try {
      const mudancasAtivas = getMudancasAtivas(mudancas)

      const recibo = await generateReceipt({
        apenado,
        processo,
        fotoAtendimento: fotoAtendimento.data,
        mudancasDetectadas: mudancasAtivas,
      })

      setReciboGerado(recibo)
      setSuccess(true)
    } catch (error) {
      setError(error.message || 'Falha ao gerar comprovante. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-auto">
      <Tabs defaultValue="novo" className="flex h-full min-h-0 w-full flex-1 flex-col">
        <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Emissão de Comprovantes</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Gere comprovantes de comparecimento com foto
            </p>
          </div>
          <TabsList className="bg-muted text-muted-foreground grid h-auto w-full grid-cols-2 items-center justify-center rounded-lg p-1 shadow-sm md:inline-flex md:h-9 md:w-auto">
            <TabsTrigger
              value="novo"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-transparent data-[state=active]:shadow-none md:px-3 md:text-sm md:whitespace-nowrap"
            >
              Novo comprovante
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-transparent data-[state=active]:shadow-none md:px-3 md:text-sm md:whitespace-nowrap"
            >
              Histórico {presencas.length > 0 ? `(${presencas.length})` : ''}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="novo"
          className="mt-0 flex min-h-0 w-full min-w-0 flex-col gap-4 overflow-y-auto pb-4 outline-none lg:flex-1 lg:items-stretch lg:gap-6 lg:overflow-visible lg:pb-0"
        >
          <form
            id="form-atendimento"
            onSubmit={handleFinalSubmit}
            className="grid min-h-0 w-full shrink-0 grid-cols-1 gap-4 p-[2px] lg:h-full lg:flex-1 lg:grid-cols-2 lg:gap-6"
          >
            <ConvictedCard
              className={`min-h-0 w-full min-w-0 transition-all duration-300 lg:h-full ${
                isSuccess ? 'pointer-events-none opacity-40 grayscale-[0.5]' : ''
              }`}
            />
            <div
              className={`flex min-h-0 w-full min-w-0 flex-col transition-all duration-300 lg:h-full ${
                !isReadyToCapture && !isSuccess
                  ? 'pointer-events-none opacity-40 grayscale-[0.5]'
                  : ''
              }`}
            >
              {isSuccess ? (
                <ReceiptSuccessCard
                  className="w-full lg:h-full"
                  atendimento={{ apenado, processo, recibo: reciboGerado }}
                  onReset={resetAtendimento}
                />
              ) : (
                <PhotoCaptureCard className="w-full lg:h-full" />
              )}
            </div>
          </form>
        </TabsContent>
        <TabsContent
          value="historico"
          className="mt-0 flex w-full min-w-0 flex-col gap-6 outline-none"
        >
          <ProofHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Service
