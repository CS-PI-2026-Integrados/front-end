import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import { generateReceiptPDF } from './pdfGenerator.js'

pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.default?.pdfMake?.vfs || pdfFonts

export async function downloadReceiptPDF(atendimento) {
  const docDefinition = await generateReceiptPDF(atendimento)

  const nomeApenado = atendimento.apenado?.fullName?.replace(/\s+/g, '_') || 'Apenado'
  const dataStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const fileName = `comprovante_${nomeApenado}_${dataStr}.pdf`

  pdfMake.createPdf(docDefinition).download(fileName)
}

export async function viewReceiptPDF(atendimento) {
  const docDefinition = await generateReceiptPDF(atendimento)
  pdfMake.createPdf(docDefinition).open()
}
