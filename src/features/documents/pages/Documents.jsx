import { useState } from 'react'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs'
import { useSession } from '@/features/authentication'
import { DocumentArchive } from '../components/DocumentArchive'
import { PhotoModal } from '../components/PhotoModal'
import { PdfPreviewModal } from '../components/PdfPreviewModal'
import { getReceiptPayload } from '../services/documentsService'
import { registerDocumentReissue } from '../services/documentsAuditService'

const Documents = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id

  const [activeTab, setActiveTab] = useState('attendance')
  const [photoDocument, setPhotoDocument] = useState(null)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [pdfPayload, setPdfPayload] = useState(null)

  function openGroup(groupId) {
    window.open(`/grupos-reflexivos/${groupId}`, '_blank', 'noopener,noreferrer')
  }

  function openPdf(document) {
    setPdfDocument(document)
    setPdfPayload(getReceiptPayload(document.id))
  }

  function closePdf(result) {
    if (result?.downloaded && pdfDocument) {
      registerDocumentReissue({
        tenantId,
        actorId: session?.user?.id,
        documentId: pdfDocument.id,
        documentType: 'attendance',
      })
    }
    setPdfDocument(null)
    setPdfPayload(null)
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
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
            onViewPhoto={setPhotoDocument}
            onDownloadPdf={openPdf}
          />
        </TabsContent>

        <TabsContent value="groups">
          <DocumentArchive tenantId={tenantId} source="group" onOpenGroup={openGroup} />
        </TabsContent>
      </Tabs>

      <PhotoModal document={photoDocument} onClose={() => setPhotoDocument(null)} />
      <PdfPreviewModal document={pdfDocument} payload={pdfPayload} onClose={closePdf} />
    </div>
  )
}

export default Documents
