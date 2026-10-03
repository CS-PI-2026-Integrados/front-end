import { apiService } from '@/shared/infrastructure/http/apiService'
import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import {
  COMPROVANTES_STORAGE_KEY,
  comprovantesIniciais,
} from '@/features/attendance/mock/receiptsMock'

const normalizeAddressForApi = (address) => ({
  zip_code: (address?.zipCode || address?.zip_code || '').replace(/\D/g, ''),
  street: (address?.street || '').trim(),
  number: (address?.number || '').trim(),
  complement: address?.complement?.trim() || null,
  neighborhood: (address?.neighborhood || '').trim(),
  city: (address?.city || '').trim(),
  state: (address?.state || '').trim().toUpperCase(),
})

const normalizeAddressFromApi = (address) => {
  if (!address) return null
  return {
    zipCode: address.zip_code || address.zipCode || '',
    street: address.street || '',
    number: address.number || '',
    complement: address.complement || '',
    neighborhood: address.neighborhood || '',
    city: address.city || '',
    state: address.state || '',
  }
}

const listeners = new Set()
let comprovantesCache

function obterComprovantes() {
  if (!comprovantesCache) {
    comprovantesCache = readJson(COMPROVANTES_STORAGE_KEY, comprovantesIniciais)
  }
  return comprovantesCache
}

export function listarComprovantes(tenantId) {
  const comprovantes = obterComprovantes()
  return tenantId
    ? comprovantes.filter((item) => String(item.tenantId) === String(tenantId))
    : comprovantes
}

export function salvarComprovante(comprovante) {
  const current = obterComprovantes()
  // Limita a 40 comprovantes mais recentes para nunca estourar a cota de 5MB do localStorage
  comprovantesCache = [comprovante, ...current].slice(0, 40)
  try {
    writeJson(COMPROVANTES_STORAGE_KEY, comprovantesCache)
  } catch {
    comprovantesCache = [comprovante, ...current.slice(0, 10)]
    try {
      writeJson(COMPROVANTES_STORAGE_KEY, comprovantesCache)
    } catch {
      // Ignora erro de cota de persistencia local
    }
  }
  listeners.forEach((listener) => listener())
  return comprovante
}

export async function gerarComprovante({
  apenado,
  processo,
  photoFile,
  tenantId,
  mudancasDetectadas = {},
  operatorName,
  institution,
}) {
  if (!apenado) throw new Error('Selecione um apenado para continuar')
  if (!tenantId && !apenado.tenantId)
    throw new Error('A comarca do atendimento não foi identificada')
  if (apenado.processes?.length && !processo)
    throw new Error('Selecione um processo para continuar')

  const attendance = await createAttendance({
    convictedId: apenado.id,
    processId: processo?.id || apenado.processes?.[0]?.id,
    address: apenado.address,
    phone: apenado.phone,
    employmentStatus: apenado.employmentStatus || apenado.workingStatus,
    photo: photoFile,
  })

  const emitidoEm = new Date().toISOString()
  const photoUrl = getAttendancePhotoUrl(attendance.id)
  return salvarComprovante({
    id: attendance.id,
    apenadoId: String(attendance.convictedId || apenado.id),
    tenantId: String(tenantId || apenado.tenantId),
    processoId: String(attendance.processId || processo?.id || apenado.processes?.[0]?.id),
    processNumber: processo?.number || apenado.processes?.[0]?.number || null,
    nomeApenado: apenado.fullName || apenado.nomeCompleto || 'Apenado',
    cpfApenado: apenado.cpf || '',
    photoUrl,
    emitidoEm: attendance.createdAt || emitidoEm,
    nomeOperador: operatorName || 'Administrador',
    codigoVerificacao: attendance.id,
    alteracoesRastreadas: Object.fromEntries(
      Object.entries(mudancasDetectadas || {}).filter(([, change]) => change?.mudou)
    ),
    configuracaoInstituicao: institution || {},
  })
}

export function obterSnapshotComprovantes() {
  return obterComprovantes()
}

export function observarComprovantes(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

async function toPhotoBlob(photo) {
  if (photo instanceof Blob) return photo
  if (typeof photo === 'string' && photo.startsWith('data:')) {
    const response = await fetch(photo)
    return response.blob()
  }
  throw new Error('Capture ou selecione uma foto para gerar o comprovante')
}

export async function createAttendance({
  convictedId,
  processId,
  address,
  phone,
  employmentStatus,
  photo,
  signal,
}) {
  if (!convictedId) throw new Error('O apenado é obrigatório.')
  if (!processId) throw new Error('O processo é obrigatório.')
  if (!photo) throw new Error('A foto do atendimento é obrigatória.')

  const photoBlob = await toPhotoBlob(photo)

  const payload = {
    convicted_id: convictedId,
    process_id: processId,
    address: normalizeAddressForApi(address),
    phone: (phone || '').replace(/\D/g, ''),
    employment_status: employmentStatus || 'UNEMPLOYED',
  }

  const formData = new FormData()
  formData.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  formData.append('photo', photoBlob, 'attendance-photo.jpg')

  const response = await apiService.post('/attendance', formData, { signal })

  return {
    id: response.id,
    convictedId: response.convicted_id,
    processId: response.process_id,
    address: normalizeAddressFromApi(response.address),
    phone: response.phone,
    employmentStatus: response.employment_status,
    userId: response.user_id,
    createdAt: response.created_at,
    updatedAt: response.updated_at,
  }
}

export function getAttendancePhotoUrl(attendanceId) {
  if (!attendanceId) return null
  return `/api/attendance/${attendanceId}/photo`
}

export async function getAttendanceReceiptBlob(attendanceId, { signal } = {}) {
  if (!attendanceId) throw new Error('ID do atendimento é obrigatório.')
  return apiService.getBlob(`/attendance/${attendanceId}/receipt`, { signal })
}
