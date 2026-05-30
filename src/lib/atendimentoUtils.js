export const formatPhone = (val) => {
  if (!val) return ''
  let value = val.replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)

  if (value.length > 10) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
  } else if (value.length > 6) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`
  } else if (value.length > 2) {
    return `(${value.slice(0, 2)}) ${value.slice(2)}`
  }
  return value
}

export const validateAtendimento = ({ apenado, processo, foto }) => {
  if (!apenado) {
    return {
      isValid: false,
      error: 'Selecione um apenado para continuar',
    }
  }

  if (!processo && apenado.processos?.length > 0) {
    return {
      isValid: false,
      error: 'Selecione um processo para continuar',
    }
  }

  // Suporta tanto foto string quanto objeto { data, isStreaming, error }
  const fotoData = typeof foto === 'object' ? foto?.data : foto

  if (!fotoData) {
    return {
      isValid: false,
      error: 'Capture ou selecione uma foto para gerar o comprovante',
    }
  }

  return { isValid: true, error: null }
}

export const hasChanges = (mudancas) => {
  if (!mudancas || Object.keys(mudancas).length === 0) return false
  return Object.values(mudancas).some((m) => m.mudou === true)
}

export const trackFieldChange = (original, novo, field) => {
  return {
    original,
    novo,
    mudou: original !== novo,
  }
}

export const getProcessoPadrao = (processos) => {
  return processos && processos.length > 0 ? processos[0] : null
}

export const getMudancasAtivas = (mudancas) => {
  return Object.entries(mudancas)
    .filter(([, m]) => m.mudou)
    .reduce(
      (acc, [field, data]) => ({
        ...acc,
        [field]: data,
      }),
      {}
    )
}

export const resetMudancas = () => ({})

export const getApenadoOriginal = (apenado) => ({
  phone: apenado?.phone,
  address: apenado?.address,
  workingStatus: apenado?.workingStatus,
})
