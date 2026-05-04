import { useState } from 'react'
import { ConvictedCard } from '@/components/service/ConvictedCard.jsx'
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs.jsx'
import { PhotoCaptureCard } from '@/components/service/PhotoCaptureCard.jsx'
import { mockApenados } from '@/mocks/apenados.mock.js'

const Service = () => {
  const [atendimento, setAtendimento] = useState({
    apenado: null,
    processo: null,
  })

  const [fotoAtendimento, setFotoAtendimento] = useState(null)

  const isReadyToCapture = Boolean(
    atendimento.apenado && (atendimento.apenado.processos?.length === 0 || atendimento.processo)
  )

  const handleGerarComprovante = (params = {}) => {
    const { apenadoAtualizado, foiAlterado, processoAtivo } = params
    if (!apenadoAtualizado) return

    const now = new Date().toISOString()
    const apenadoFinal = { ...apenadoAtualizado, lastProof: now }

    if (foiAlterado) {
      const index = mockApenados.apenados.findIndex((a) => a.id === apenadoFinal.id)
      if (index !== -1) {
        mockApenados.apenados[index] = apenadoFinal
      }
    }

    setAtendimento((prev) => ({
      ...prev,
      apenado: apenadoFinal,
      processo: processoAtivo || prev.processo,
    }))

    const snapshot = {
      idApenado: apenadoFinal.id,
      idProcesso: processoAtivo?.id || atendimento.processo?.id,
      fotoBase64: fotoAtendimento,
      timestamp: now,
      tenant_id: 'default-tenant',
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
                onFinalSubmit={handleGerarComprovante}
              />
              <div
                className={`w-full transition-all duration-300 md:flex-1 ${
                  !isReadyToCapture ? 'pointer-events-none opacity-40 grayscale-[0.5]' : ''
                }`}
              >
                <PhotoCaptureCard onPhotoSelect={setFotoAtendimento} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default Service
