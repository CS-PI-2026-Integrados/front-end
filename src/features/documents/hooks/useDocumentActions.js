import { useState } from 'react'
import { useReceiptPdfActions, useAttendancePhoto } from '@/features/attendance'

export function useDocumentActions() {
  const [selectedPhoto, setPhoto] = useState(null)
  const [pdfDocument, setPdf] = useState(null)
  const photo = useAttendancePhoto(selectedPhoto?.id)
  const pdf = useReceiptPdfActions()
  return {
    photoDocument: selectedPhoto ? { ...selectedPhoto, photoUrl: photo.url } : null,
    photoLoading: photo.isLoading,
    photoError: photo.error,
    openPhoto: setPhoto,
    closePhoto: () => setPhoto(null),
    pdfDocument,
    openPdf: setPdf,
    closePdf: () => {
      pdf.release()
      setPdf(null)
    },
    downloadPdf: async () => {
      if (await pdf.download(pdfDocument)) setPdf(null)
    },
    viewPdf: () => pdf.view(pdfDocument),
    viewDocumentPdf: pdf.view,
    downloadDocumentPdf: pdf.download,
    isProcessing: pdf.isProcessing,
    pdfError: pdf.error,
  }
}
