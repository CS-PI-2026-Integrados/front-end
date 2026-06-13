const EMPTY_VALUE = '-'

export const maskCpf = (cpf) => {
  const digits = String(cpf || '').replace(/\D/g, '')

  if (digits.length < 9) return EMPTY_VALUE

  return `•••.${digits.slice(3, 6)}.${digits.slice(6, 9)}-••`
}

export const maskEmail = (email) => {
  const [localPart, domain] = String(email || '').split('@')

  if (!localPart || !domain) return EMPTY_VALUE

  const visibleChars = localPart.length > 2 ? 2 : 1

  return `${localPart.slice(0, visibleChars)}***@${domain}`
}

export const formatDate = (value) => {
  if (!value) return EMPTY_VALUE

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  return date.toLocaleDateString('pt-BR')
}

export const formatDateTime = (value) => {
  if (!value) return EMPTY_VALUE

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return EMPTY_VALUE

  const formattedDate = date.toLocaleDateString('pt-BR')
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${formattedDate} às ${formattedTime}`
}

export const getRoleLabel = (role) => {
  return role?.label || EMPTY_VALUE
}

export const getActiveStatusLabel = (isActive) => {
  return isActive ? 'ATIVO' : 'INATIVO'
}

export const getSessionStatusLabel = (hasActiveSession) => {
  return hasActiveSession ? 'Sessão ativa' : 'Sessão inativa'
}

export const normalizeSearch = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}
