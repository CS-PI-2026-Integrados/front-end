import { useState } from 'react'
import { ConvictedCard } from '@/components/service/ConvictedCard.jsx'
import { useService } from '@/context/ServiceContext'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs.jsx'
import { PhotoCaptureCard } from '@/components/service/PhotoCaptureCard.jsx'
import { useGenerateReceipt } from '@/hooks/useGenerateReceipt.js'
import { ReceiptSuccessCard } from '@/components/service/ReceiptSuccessCard.jsx'

const Service = () => {
  const {
    atendimento,
    fotoAtendimento,
    isSuccess,
    isSubmitting,
    setAtendimento,
    setFotoAtendimento,
    setErrorMessage,
    setIsSuccess,
    setMudancasDetectadas,
  } = useService()

  const isReadyToCapture = Boolean(
    atendimento.apenado && (atendimento.apenado.processos?.length === 0 || atendimento.processo)
  )

  // const { generateReceipt } = useGenerateReceipt({
  //   setAtendimento,
  // })

  // const handleChangeAtendimento = (novoAtendimento) => {
  //   if (novoAtendimento.apenado?.id !== atendimento.apenado?.id) {
  //     setErrorMessage('')
  //     setIsSuccess(false)
  //     setMudancasDetectadas({})
  //   }
  //   setAtendimento(novoAtendimento)
  // }

  // const handleMudancasDetectadas = (mudancas) => {
  //   setMudancasDetectadas(mudancas)
  // }

  // const resetForm = () => {
  //   setAtendimento({ apenado: null, processo: null })
  //   setFotoAtendimento(null)
  //   setErrorMessage('')
  //   setIsSuccess(false)
  // }

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
      await generateReceipt({
        apenadoAtualizado: atendimento.apenado,
        processoAtivo: atendimento.processo,
        fotoAtendimento,
        mudancasDetectadas,
      })
      setIsSuccess(true)
      console.log(atendimento.apenado)
    } catch (error) {
      console.error('Falha ao gerar comprovante:', error)
      setErrorMessage(error.message || 'Falha ao gerar comprovante. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-7xl flex-col md:h-full">
      <Tabs defaultValue="novo" className="flex min-h-0 w-full flex-1 flex-col">
        <div className="mb-4 flex shrink-0 flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Emissão de Comprovantes</h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Gere comprovantes de comparecimento com foto
            </p>
          </div>
          <TabsList className="bg-muted text-muted-foreground inline-flex h-9 w-full shrink-0 items-center justify-center rounded-lg p-0.5 shadow-sm md:w-auto">
            <TabsTrigger
              value="novo"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary inline-flex h-full items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Novo comprovante
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary inline-flex h-full items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>
        {/* 
        {errorMessage && (
          <div className="bg-destructive/10 border-destructive text-destructive mb-4 shrink-0 rounded-lg border p-3 text-sm">
            {errorMessage}
          </div>
        )} */}

        <TabsContent
          value="novo"
          className="mt-0 flex w-full flex-col gap-6 outline-none md:min-h-0 md:flex-1 md:flex-row md:items-stretch"
        >
          <form id="form-atendimento" onSubmit={handleFinalSubmit} className="contents">
            <ConvictedCard
              className={`w-full transition-all duration-300 md:h-full md:flex-1 ${
                isSuccess ? 'pointer-events-none opacity-40 grayscale-[0.5]' : ''
              }`}
            />
            {/* <div
              className={`flex w-full flex-col transition-all duration-300 md:min-h-0 md:flex-1 ${!isReadyToCapture && !isSuccess
                ? 'pointer-events-none opacity-40 grayscale-[0.5]'
                : ''
                }`}
            >
              {isSuccess ? (
                <ReceiptSuccessCard
                  className="flex-1 md:h-full"
                  atendimento={atendimento}
                  onReset={resetForm}
                />
              ) : (
                <PhotoCaptureCard
                  className="flex-1 md:h-full"
                  isReady={isReadyToCapture}
                  isSubmitting={isSubmitting}
                  photo={fotoAtendimento}
                  onPhotoSelect={setFotoAtendimento}
                  apenado={atendimento.apenado}
                />
              )}
            </div> */}
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Service
