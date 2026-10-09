import { useState } from 'react'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { useSession } from '@/features/authentication'
import { DocumentArchive } from '../components/DocumentArchive'
import { PhotoModal } from '../components/PhotoModal'
import { PdfPreviewModal } from '../components/PdfPreviewModal'
import { useDocumentActions } from '../hooks/useDocumentActions'
import { useLocation } from 'react-router-dom'

const Documents = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id
  const location = useLocation()
  const quickSearchFilter = location.state?.quickSearchFilter ?? ''

  const [activeTab, setActiveTab] = useState('attendance')

  const {
    photoDocument,
    photoLoading,
    photoError,
    openPhoto,
    closePhoto,
    pdfDocument,
    openPdf,
    closePdf,
    downloadPdf,
    viewPdf,
    viewDocumentPdf,
    downloadDocumentPdf,
    isProcessing,
    pdfError,
  } = useDocumentActions(tenantId)

  return (
    <div className="min-w-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="min-w-0">
        <PageHeader
          title="Arquivo de Documentos"
          description="Repositório centralizado de comprovantes e documentos"
          action={
            <TabsList aria-label="Origem dos documentos">
              <TabsTrigger value="attendance">Atendimentos</TabsTrigger>
              <TabsTrigger value="groups">Grupos Reflexivos</TabsTrigger>
            </TabsList>
          }
        />

        <TabsContent value="attendance">
          <DocumentArchive
            key={quickSearchFilter || 'attendance'}
            tenantId={tenantId}
            source="attendance"
            initialSearch={quickSearchFilter}
            onViewPhoto={openPhoto}
            onViewPdf={viewDocumentPdf}
            onDownloadPdf={downloadDocumentPdf}
            onOpenPdf={openPdf}
            isProcessing={isProcessing}
          />
        </TabsContent>

        <TabsContent value="groups">
          <p className="text-muted-foreground rounded-lg border border-dashed p-6">
            Documentos de grupos reflexivos indisponíveis até haver suporte da API.
          </p>
        </TabsContent>
      </Tabs>
      {pdfError && !pdfDocument && (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {pdfError}
        </p>
      )}

      <PhotoModal
        document={photoDocument}
        isLoading={photoLoading}
        error={photoError}
        onClose={closePhoto}
      />
      <PdfPreviewModal
        document={pdfDocument}
        isProcessing={isProcessing}
        error={pdfError}
        onDownload={downloadPdf}
        onView={viewPdf}
        onClose={closePdf}
      />
    </div>
  )
}

export default Documents
