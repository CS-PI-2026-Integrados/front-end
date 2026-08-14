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
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => {
      resolve(null)
    }
    img.src = imageUrl
  })
}

export const generateReceiptPDF = async (atendimento) => {
  const { apenado, processo, recibo, mudancasDetectadas = {} } = atendimento
  const configuracaoInstituicao = recibo?.configuracaoInstituicao || {}

  const receiptConfig = {
    mostrarFotoReferencia: true,
    mostrarFotoAtendimento: true,
    mostrarCpf: true,
    mostrarProcessoVara: true,
    mostrarNomeServidor: true,
    mostrarAssinaturaDigital: false,
    ...configuracaoInstituicao.receiptConfig,
  }

  const receiptFields = Array.isArray(configuracaoInstituicao.receiptFields)
    ? configuracaoInstituicao.receiptFields
    : [
        { key: 'phone', label: 'Telefone', visible: true, editable: true },
        { key: 'address', label: 'Endereço', visible: true, editable: true },
        { key: 'workingStatus', label: 'Situação Trabalhista', visible: true, editable: true },
      ]

  const tenantLogo = configuracaoInstituicao.logo
  let logoBase64 = null
  if (tenantLogo) {
    logoBase64 = tenantLogo.startsWith('data:') ? tenantLogo : tenantLogo
  } else {
    logoBase64 = await getBase64ImageFromUrl(tjprLogo)
  }

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

  let dataExtenso = ''
  if (recibo?.emitidoEm) {
    const d = new Date(recibo.emitidoEm)
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

  const getFieldValue = (field) => {
    switch (field.key) {
      case 'address':
        return mudancasDetectadas?.address?.novo || apenado?.address || 'Não informado'
      case 'phone':
        return mudancasDetectadas?.phone?.novo || apenado?.phone || 'Não informado'
      case 'workingStatus':
        return formatWorkingStatus(
          mudancasDetectadas?.workingStatus?.novo || apenado?.workingStatus
        )
      default:
        return 'Não informado'
    }
  }

  const visibleFieldRows = receiptFields
    .filter((field) => field.visible)
    .map((field) => [
      {
        text: field.label || field.key,
        alignment: 'left',
        margin: [5, 5],
        bold: true,
        border: [false, false, false, true],
      },
      {
        text: mudancasDetectadas?.[field.key]?.mudou ? 'Atualizado' : 'Confirmado',
        alignment: 'center',
        margin: [0, 5],
        color: '#555',
        border: [false, false, false, true],
      },
      {
        text: getFieldValue(field),
        alignment: 'left',
        margin: [5, 5],
        border: [false, false, false, true],
      },
    ])

  const fieldTable = visibleFieldRows.length
    ? {
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
            ...visibleFieldRows,
          ],
        },
        layout: {
          hLineColor: function () {
            return '#e2e8f0'
          },
          vLineColor: function () {
            return '#e2e8f0'
          },
        },
        marginBottom: 30,
      }
    : null

  const photoColumns = []
  if (receiptConfig.mostrarFotoReferencia) {
    photoColumns.push({
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
    })
  }

  if (receiptConfig.mostrarFotoAtendimento) {
    photoColumns.push({
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
    })
  }

  const operadorLine = receiptConfig.mostrarNomeServidor
    ? [{ text: 'Operador: ', bold: true }, `${recibo?.nomeOperador || 'Não informado'}\n`]
    : []

  const processoVaraLine = receiptConfig.mostrarProcessoVara
    ? [
        { text: 'Fórum: ', bold: true },
        `${configuracaoInstituicao.nomeComarca || 'Não informado'}\n`,
        { text: 'Vara: ', bold: true },
        `${configuracaoInstituicao.unidade || 'Não informado'}\n`,
      ]
    : []

  const cpfLine = receiptConfig.mostrarCpf
    ? [{ text: 'CPF: ', bold: true }, `${apenado?.cpf || 'Não informado'}\n`]
    : []

  const signatureBlock = receiptConfig.mostrarAssinaturaDigital
    ? {
        stack: [
          {
            text: 'Assinatura Digital',
            bold: true,
            fontSize: 11,
            margin: [0, 4, 0, 4],
          },
          {
            text: 'Documento assinado digitalmente pelo sistema.',
            fontSize: 10,
            color: '#555',
          },
        ],
        margin: [0, 0, 0, 30],
        alignment: 'center',
      }
    : null

  const content = [
    {
      columns: [
        logoBase64
          ? { image: logoBase64, fit: [160, 60], alignment: 'left' }
          : { text: 'TJPR', width: 140, fontSize: 24, bold: true },
        {
          width: '*',
          stack: [
            { text: 'COMPROVANTE DE COMPARECIMENTO', style: 'headerTitle', alignment: 'right' },
            {
              text: `${configuracaoInstituicao.nomeComarca || 'Comarca não informada'} — ${configuracaoInstituicao.unidade || ''}`,
              style: 'headerSecretaria',
              alignment: 'right',
            },
            configuracaoInstituicao.endereco
              ? {
                  text: configuracaoInstituicao.endereco,
                  style: 'headerAddress',
                  alignment: 'right',
                  margin: [0, 8, 0, 0],
                }
              : null,
          ].filter(Boolean),
          margin: [0, 10, 0, 0],
        },
      ],
      marginBottom: 40,
    },
    {
      text: [
        { text: 'Processo: ', bold: true },
        `${processo?.numeroProcesso || 'Sem Processo Vinculado'}\n`,
        { text: 'Nome: ', bold: true },
        `${apenado?.nomeCompleto || 'Apenado'}\n`,
        ...cpfLine,
        ...processoVaraLine,
        ...operadorLine,
        { text: 'Protocolo de Validação: ', bold: true },
        `${recibo?.codigoVerificacao || 'Não gerado'}`,
      ],
      style: 'processData',
      marginBottom: 30,
    },
  ]

  if (fieldTable) {
    content.push(fieldTable)
  }

  content.push(
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
    }
  )

  if (photoColumns.length > 0) {
    content.push({
      columns: photoColumns,
      marginBottom: 40,
    })
  }

  if (signatureBlock) {
    content.push(signatureBlock)
  }

  content.push({
    text: 'Este documento foi gerado automaticamente pelo sistema SICAPE na presença do apenado, mediante registro e validação de biometria facial.',
    alignment: 'center',
    fontSize: 8,
    color: '#999',
    italics: true,
  })

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [50, 50, 50, 50],
    content,
    styles: {
      headerTitle: {
        fontSize: 12,
        bold: true,
        color: '#333',
      },
      headerSecretaria: {
        fontSize: 11,
        bold: true,
        color: '#333',
      },
      headerAddress: {
        fontSize: 10,
        color: '#555',
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
