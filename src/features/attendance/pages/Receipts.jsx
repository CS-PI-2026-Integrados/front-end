import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useConvictedDetail, useConvictedPhoto } from '@/features/convicteds'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { SelectConvicted } from '../components/SelectConvicted'
import { PhotoCaptureCard } from '../components/PhotoCaptureCard'
import { ProofHistory } from '../components/ProofHistory'
import { ReceiptSuccessCard } from '../components/ReceiptSuccessCard'
import { useReceiptFlow } from '../hooks/useReceiptFlow'
import { useReceiptPdfActions } from '../hooks/useReceiptPdfActions'

export default function Receipts() {
  const flow = useReceiptFlow()
  const { selectConvicted } = flow
  const pdf = useReceiptPdfActions()
  const location = useLocation()
  const selectedId = location.state?.apenadoId
  const detail = useConvictedDetail(selectedId)
  useEffect(() => {
    if (detail.convicted && detail.convicted.id === selectedId) selectConvicted(detail.convicted)
  }, [detail.convicted, selectedId, selectConvicted])
  const photo = useConvictedPhoto(flow.convicted?.id)
  const ready = Boolean(flow.convicted && flow.process?.status === 'ACTIVE')
  return (
    <Tabs defaultValue="new" className="min-h-full lg:h-full lg:min-h-0">
      <PageHeader
        title="Emissão de Comprovantes"
        description="Gere comprovantes de comparecimento com foto"
        action={
          <TabsList className="bg-muted text-muted-foreground grid h-auto w-full grid-cols-2 items-center justify-center rounded-lg p-1 shadow-sm md:inline-flex md:h-9 md:w-auto">
            <TabsTrigger
              value="new"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-transparent data-[state=active]:shadow-none md:px-3 md:text-sm md:whitespace-nowrap"
            >
              Novo comprovante
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="ring-offset-background focus-visible:ring-ring data-[state=active]:bg-primary data-[state=active]:text-primary-foreground inline-flex h-full min-h-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-transparent data-[state=active]:shadow-none md:px-3 md:text-sm md:whitespace-nowrap"
            >
              Histórico
            </TabsTrigger>
          </TabsList>
        }
      />
      <TabsContent value="new" className="flex flex-col data-[state=inactive]:hidden lg:min-h-0">
        <form
          noValidate
          onSubmit={flow.submit}
          id="form-atendimento"
          className="grid flex-1 items-stretch gap-5 lg:min-h-0 lg:grid-cols-2"
        >
          <SelectConvicted
            disabled={flow.isSubmitting || Boolean(flow.receipt)}
            errors={flow.fieldErrors}
          />
          {flow.receipt ? (
            <ReceiptSuccessCard
              className="h-full"
              receipt={flow.receipt}
              convicted={flow.convicted}
              process={flow.process}
              onReset={() => {
                pdf.release()
                flow.reset()
              }}
              onDownload={pdf.download}
              onView={pdf.view}
              isProcessing={pdf.isProcessing}
              error={pdf.error}
            />
          ) : (
            <div className="flex h-full flex-col gap-3">
              <PhotoCaptureCard
                className="h-full flex-1"
                file={flow.photo}
                onCapture={(file) => {
                  flow.setPhoto(file)
                  flow.setPhotoError(null)
                }}
                onClear={() => flow.setPhoto(null)}
                onError={flow.setPhotoError}
                referencePhotoUrl={photo.url}
                deviceId={flow.deviceId}
                isReadyToCapture={ready}
                isSubmitting={flow.isSubmitting}
                error={flow.photoError || flow.fieldErrors?.photo || flow.error}
              />
              {flow.fields.length > 0 && (
                <ul role="alert" className="text-destructive text-sm">
                  {flow.fields.map((field, index) => (
                    <li key={`${field.field}-${index}`}>{field.message}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </form>
      </TabsContent>
      <TabsContent value="history">
        <ProofHistory />
      </TabsContent>
    </Tabs>
  )
}
