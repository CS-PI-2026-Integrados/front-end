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

  let capturedPhotoBase64 = null
  if (recibo?.photoUrl) {
    if (recibo.photoUrl.startsWith('data:')) {
      capturedPhotoBase64 = recibo.photoUrl
    } else {
      capturedPhotoBase64 = await getBase64ImageFromUrl(recibo.photoUrl)
    }
  }

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

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [50, 50, 50, 50],
    content: [
      {
        columns: [
          logoBase64
            ? { image: logoBase64, fit: [160, 60], alignment: 'left' }
            : { text: 'TJPR', width: 140, fontSize: 24, bold: true },
          {
            width: '*',
            text: 'COMPROVANTE DE COMPARECIMENTO\nSECRETARIA CRIMINAL - TERRA RICA',
            style: 'headerSecretaria',
            alignment: 'right',
            margin: [0, 15, 0, 0],
          },
        ],
        marginBottom: 40,
      },
      {
        text: [
          { text: 'Processo: ', bold: true },
          `${processo?.processNumber || 'Sem Processo Vinculado'}\n`,
          { text: 'Nome: ', bold: true },
          `${apenado?.fullName || 'Apenado'}\n`,
          { text: 'CPF: ', bold: true },
          `${apenado?.cpf || 'Não informado'}\n`,
          { text: 'Fórum: ', bold: true },
          'FÓRUM DE TERRA RICA\n',
          { text: 'Vara: ', bold: true },
          'EXECUÇÃO MEIO ABERTO - TERRA RICA\n',
          { text: 'Protocolo de Validação: ', bold: true },
          `${recibo?.verificationCode || 'Não gerado'}`,
        ],
        style: 'processData',
        marginBottom: 30,
      },
      {
        table: {
          widths: [100, 100, '*'],
          body: [
            [
              {
                text: 'Controle de Informações',
                colSpan: 3,
                alignment: 'center',
                style: 'tableHeader',
                border: [false, false, false, true],
              },
              {},
              {},
            ],
            [
              {
                text: 'Endereço',
                alignment: 'left',
                margin: [5, 5],
                bold: true,
                border: [false, false, false, true],
              },
              {
                text: mudancasDetectadas?.address?.mudou ? 'Atualizado' : 'Confirmado',
                alignment: 'center',
                margin: [0, 5],
                color: '#555',
                border: [false, false, false, true],
              },
              {
                text: mudancasDetectadas?.address?.novo || apenado?.address || 'Não informado',
                alignment: 'left',
                margin: [5, 5],
                border: [false, false, false, true],
              },
            ],
            [
              {
                text: 'Telefone',
                alignment: 'left',
                margin: [5, 5],
                bold: true,
                border: [false, false, false, true],
              },
              {
                text: mudancasDetectadas?.phone?.mudou ? 'Atualizado' : 'Confirmado',
                alignment: 'center',
                margin: [0, 5],
                color: '#555',
                border: [false, false, false, true],
              },
              {
                text: mudancasDetectadas?.phone?.novo || apenado?.phone || 'Não informado',
                alignment: 'left',
                margin: [5, 5],
                border: [false, false, false, true],
              },
            ],
            [
              {
                text: 'Trabalho',
                alignment: 'left',
                margin: [5, 5],
                bold: true,
                border: [false, false, false, true],
              },
              {
                text: mudancasDetectadas?.workingStatus?.mudou ? 'Atualizado' : 'Confirmado',
                alignment: 'center',
                margin: [0, 5],
                color: '#555',
                border: [false, false, false, true],
              },
              {
                text: formatWorkingStatus(
                  mudancasDetectadas?.workingStatus?.novo || apenado?.workingStatus
                ),
                alignment: 'left',
                margin: [5, 5],
                border: [false, false, false, true],
              },
            ],
          ],
        },
        layout: {
          hLineColor: function (i, node) {
            return '#e2e8f0'
          },
          vLineColor: function (i, node) {
            return '#e2e8f0'
          },
        },
        marginBottom: 30,
      },
      {
        text: 'Este é o comprovante oficial de validação de presença do réu.',
        alignment: 'center',
        marginBottom: 5,
        fontSize: 11,
      },
      {
        text: `Compareceu presencialmente nesta comarca na data de ${dataExtenso}.`,
        alignment: 'center',
        marginBottom: 30,
        fontSize: 11,
        bold: true,
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              referencePhotoBase64
                ? { image: referencePhotoBase64, fit: [140, 140], alignment: 'center' }
                : {
                    text: '[Sem Foto de Cadastro]',
                    margin: [0, 60, 0, 60],
                    alignment: 'center',
                    color: '#666',
                  },
              {
                text: 'Foto do Cadastro',
                alignment: 'center',
                fontSize: 10,
                margin: [0, 10, 0, 0],
                color: '#333',
              },
            ],
            alignment: 'center',
          },
          {
            width: '*',
            stack: [
              capturedPhotoBase64
                ? { image: capturedPhotoBase64, fit: [140, 140], alignment: 'center' }
                : {
                    text: '[Sem Registro]',
                    margin: [0, 60, 0, 60],
                    alignment: 'center',
                    color: '#666',
                  },
              {
                text: 'Registro da Presença',
                alignment: 'center',
                fontSize: 10,
                margin: [0, 10, 0, 0],
                color: '#333',
              },
            ],
            alignment: 'center',
          },
        ],
        marginBottom: 40,
      },
      {
        text: 'Este documento foi gerado automaticamente pelo sistema SICAPE na presença do apenado, mediante registro e validação de biometria facial.',
        alignment: 'center',
        fontSize: 8,
        color: '#999',
        italics: true,
      },
    ],
    styles: {
      headerSecretaria: {
        fontSize: 11,
        bold: true,
        color: '#333',
      },
      processData: {
        fontSize: 11,
        lineHeight: 1.4,
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: '#333',
        margin: [0, 0, 0, 10],
      },
    },
    defaultStyle: {
      fontSize: 11,
    },
  }

  return docDefinition
}
