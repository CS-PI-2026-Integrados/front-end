import { useState } from 'react'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { useSession } from '@/features/authentication'
import { DocumentArchive } from '../components/DocumentArchive'
import { PhotoModal } from '../components/PhotoModal'
import { PdfPreviewModal } from '../components/PdfPreviewModal'
import { useDocumentActions } from '../hooks/useDocumentActions'

const Documents = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id

  const [activeTab, setActiveTab] = useState('attendance')

  const {
    photoDocument,
    openPhoto,
    closePhoto,
    pdfDocument,
    openPdf,
    closePdf,
    downloadPdf,
    viewPdf,
    isProcessing,
    pdfError,
  } = useDocumentActions(tenantId)

  function openGroup(groupId) {
    window.open(`/grupos-reflexivos/${groupId}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="">
      <PageHeader
        title="Arquivo de Documentos"
        description="Repositório centralizado de comprovantes e documentos"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="attendance">Atendimentos</TabsTrigger>
          <TabsTrigger value="groups">Grupos Reflexivos</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <DocumentArchive
            tenantId={tenantId}
            source="attendance"
            onViewPhoto={openPhoto}
            onDownloadPdf={openPdf}
          />
        </TabsContent>

        <TabsContent value="groups">
          <DocumentArchive tenantId={tenantId} source="group" onOpenGroup={openGroup} />
        </TabsContent>
      </Tabs>

      <PhotoModal document={photoDocument} onClose={closePhoto} />
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
