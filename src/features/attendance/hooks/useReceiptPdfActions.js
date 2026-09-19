import { useCallback } from 'react'
import { downloadReceiptPDF, viewReceiptPDF } from '@/features/attendance/services/pdfService'

export function useReceiptPdfActions() {
  const download = useCallback((attendance) => downloadReceiptPDF(attendance), [])
  const view = useCallback((attendance) => viewReceiptPDF(attendance), [])
  return { download, view }
}
