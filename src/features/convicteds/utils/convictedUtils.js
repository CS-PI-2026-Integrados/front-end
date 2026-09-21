export const EMPLOYMENT_STATUS = {
  FORMAL_WORK: 'FORMAL_WORK',
  INFORMAL_WORK: 'INFORMAL_WORK',
  UNEMPLOYED: 'UNEMPLOYED',
}

export const EMPLOYMENT_STATUS_LABELS = {
  FORMAL_WORK: 'Trabalho Registrado',
  INFORMAL_WORK: 'Trabalho Informal',
  UNEMPLOYED: 'Não Trabalha',
}

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: EMPLOYMENT_STATUS.FORMAL_WORK, label: EMPLOYMENT_STATUS_LABELS.FORMAL_WORK },
  { value: EMPLOYMENT_STATUS.INFORMAL_WORK, label: EMPLOYMENT_STATUS_LABELS.INFORMAL_WORK },
  { value: EMPLOYMENT_STATUS.UNEMPLOYED, label: EMPLOYMENT_STATUS_LABELS.UNEMPLOYED },
]

export const CONVICTED_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_PHOTO: 'PENDING_PHOTO',
}

export const CONVICTED_STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  PENDING_PHOTO: 'Pendente de Foto',
}

export function formatAddress(address) {
  if (!address) return ''

  const street = [address.street, address.number].filter(Boolean).join(', ')
  const city = [address.city, address.state].filter(Boolean).join('/')
  const location = [address.neighborhood, city].filter(Boolean).join(' - ')

  return [street, address.complement, location].filter(Boolean).join(' · ')
}

export function getEmploymentStatusLabel(status) {
  return EMPLOYMENT_STATUS_LABELS[status] || status || '-'
}

export function getConvictedStatusLabel(status) {
  return CONVICTED_STATUS_LABELS[status] || status || '-'
}
