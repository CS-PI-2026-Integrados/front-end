import { useCallback, useState } from 'react'
import { useSession } from '@/features/authentication'
import { useTenant } from '@/features/institutions'
import { useReceiptPdfActions } from '@/features/attendance'
import { getReceiptPayload } from '../services/documentsService'
import { registerDocumentReissue } from '../services/documentsAuditService'

function buildReceiptConfig(state) {
  if (!state?.isLoaded) return null
  return {
    nomeComarca: state.nomeComarca,
    unidade: state.unidade,
    endereco: state.endereco,
    logo: state.logo,
    receiptConfig: state.receiptConfig,
    receiptFields: state.receiptFields,
  }
}

export function useDocumentActions(tenantId) {
  const { session } = useSession()
  const { state: tenantState } = useTenant()
  const { download, view } = useReceiptPdfActions()

  const [photoDocument, setPhotoDocument] = useState(null)
  const [pdfDocument, setPdfDocument] = useState(null)
  const [isProcessing, setProcessing] = useState(false)
  const [pdfError, setPdfError] = useState(null)

  const openPhoto = useCallback((document) => setPhotoDocument(document), [])
  const closePhoto = useCallback(() => setPhotoDocument(null), [])

  const openPdf = useCallback((document) => {
    setPdfError(null)
    setPdfDocument(document)
  }, [])

  const closePdf = useCallback(() => {
    setPdfDocument(null)
    setPdfError(null)
  }, [])

  const buildPayload = useCallback(() => {
    if (!pdfDocument) return null
    const receiptConfig = buildReceiptConfig(tenantState)
    return getReceiptPayload(pdfDocument.id, tenantId, receiptConfig)
  }, [pdfDocument, tenantId, tenantState])

  const downloadPdf = useCallback(async () => {
    const payload = buildPayload()
    if (!payload) return

    setProcessing(true)
    setPdfError(null)
    try {
      await download(payload)
      registerDocumentReissue({
        tenantId,
        actorId: session?.user?.id,
        documentId: pdfDocument.id,
        documentType: 'attendance',
      })
      closePdf()
    } catch {
      setPdfError('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setProcessing(false)
    }
  }, [buildPayload, closePdf, download, pdfDocument, session?.user?.id, tenantId])

  const viewPdf = useCallback(async () => {
    const payload = buildPayload()
    if (!payload) return

    setPdfError(null)
    try {
      await view(payload)
    } catch {
      setPdfError('Não foi possível abrir o PDF. Tente novamente.')
    }
  }, [buildPayload, view])

  return {
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
  }
}
