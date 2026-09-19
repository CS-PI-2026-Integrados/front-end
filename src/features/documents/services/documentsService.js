import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { listarComprovantes } from '@/features/attendance'
import { listarApenados } from '@/features/convicteds'
import { GROUP_DOCUMENTS_STORAGE_KEY, documentosGrupoIniciais } from '../mock/groupDocumentsMock'

const VIEW_PREFERENCE_STORAGE_KEY = 'sicape:documentos:view:v1'
const DEFAULT_VIEW = 'grid'

function buildProcessNumberResolver(tenantId) {
  const convicteds = listarApenados().filter(
    (apenado) => String(apenado.tenantId) === String(tenantId)
  )

  return (convictedId, processId) => {
    const convicted = convicteds.find((item) => String(item.id) === String(convictedId))
    if (!convicted) return '—'
    const process = (convicted.processos || []).find(
      (item) => String(item.id) === String(processId)
    )
    return process?.numeroProcesso || '—'
  }
}

function toDocument(comprovante, resolveProcessNumber) {
  return {
    id: comprovante.id,
    tenantId: comprovante.tenantId,
    convictedId: comprovante.apenadoId,
    convictedName: comprovante.nomeApenado,
    convictedCpf: comprovante.cpfApenado,
    processNumber: resolveProcessNumber(comprovante.apenadoId, comprovante.processoId),
    photoUrl: comprovante.photoUrl,
    pdfUrl: comprovante.pdfUrl,
    issuedAt: comprovante.emitidoEm,
    operatorName: comprovante.nomeOperador,
    verificationCode: comprovante.codigoVerificacao,
  }
}

function toGroupDocument(documento) {
  return {
    id: documento.id,
    tenantId: documento.tenantId,
    convictedId: documento.apenadoId,
    groupId: documento.grupoId,
    convictedName: documento.nomeApenado,
    processNumber: documento.numeroProcesso,
    groupName: documento.nomeGrupo,
    type: documento.tipo,
    issuedAt: documento.geradoEm,
  }
}

export function listDocuments(tenantId) {
  const resolveProcessNumber = buildProcessNumberResolver(tenantId)
  return listarComprovantes(tenantId).map((comprovante) =>
    toDocument(comprovante, resolveProcessNumber)
  )
}

export function listGroupDocuments(tenantId) {
  const documentos = readJson(GROUP_DOCUMENTS_STORAGE_KEY, documentosGrupoIniciais)
  return documentos
    .filter((documento) => String(documento.tenantId) === String(tenantId))
    .map(toGroupDocument)
}

export function readViewPreference() {
  return readJson(VIEW_PREFERENCE_STORAGE_KEY, DEFAULT_VIEW)
}

export function saveViewPreference(view) {
  writeJson(VIEW_PREFERENCE_STORAGE_KEY, view)
  return view
}
