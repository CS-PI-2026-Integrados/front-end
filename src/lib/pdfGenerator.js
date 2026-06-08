import tjprLogo from '@/components/img/tjpr_logo.png'

export async function getBase64ImageFromUrl(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch (error) {
        console.warn('Erro ao processar imagem no Canvas:', error)
        resolve(null)
      }
    }
    img.onerror = () => {
      console.warn('Não foi possível carregar a imagem de referência para o PDF:', imageUrl)
      resolve(null)
    }
    img.src = imageUrl
  })
}

export const generateReceiptPDF = async (atendimento) => {
  const { apenado, processo, recibo, mudancasDetectadas } = atendimento

  let referencePhotoBase64 = null
  if (apenado?.referencePhotoUrl) {
    referencePhotoBase64 = await getBase64ImageFromUrl(apenado.referencePhotoUrl)
  }

  const capturedPhotoBase64 = recibo?.photoUrl

  const logoBase64 = await getBase64ImageFromUrl(tjprLogo)

  let dataExtenso = ''
  if (recibo?.dateTime) {
    const d = new Date(recibo.dateTime)
    const options = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    dataExtenso = d.toLocaleDateString('pt-BR', options).replace(',', ' às')
  }

  const formatWorkingStatus = (status) => {
    if (!status) return 'Não informado'
    const map = {
      working_formal: 'Trabalho Formal',
      working_informal: 'Trabalho Informal',
      unemployed: 'Desempregado',
      retired: 'Aposentado',
    }
    return map[status] || status
  }

  const docDefinition = {}

  return docDefinition
}
