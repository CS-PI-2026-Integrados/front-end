import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { listarComprovantes, obterSnapshotComprovantes } from '@/features/attendance'
import { listarApenados, listarProcessos } from '@/features/convicteds'
import { GROUP_DOCUMENTS_STORAGE_KEY, documentosGrupoIniciais } from '../mock/groupDocumentsMock'

const VIEW_PREFERENCE_STORAGE_KEY = 'sicape:documentos:view:v1'
const DEFAULT_VIEW = 'grid'

function findProcess(processId, tenantId) {
  return (
    listarProcessos(tenantId).find((process) => String(process.id) === String(processId)) || null
  )
}

function toDocument(comprovante) {
  const process = findProcess(comprovante.processoId, comprovante.tenantId)
  return {
    id: comprovante.id,
    tenantId: comprovante.tenantId,
    convictedId: comprovante.apenadoId,
    processId: comprovante.processoId,
    convictedName: comprovante.nomeApenado,
    convictedCpf: comprovante.cpfApenado,
    processNumber: process?.processNumber || '—',
    photoUrl: comprovante.photoUrl,
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
  return listarComprovantes(tenantId).map(toDocument)
}

export function listGroupDocuments(tenantId) {
  const documentos = readJson(GROUP_DOCUMENTS_STORAGE_KEY, documentosGrupoIniciais)
  return documentos
    .filter((documento) => String(documento.tenantId) === String(tenantId))
    .map(toGroupDocument)
}

export function getReceiptPayload(documentId, tenantId, receiptConfig) {
  const recibo = obterSnapshotComprovantes().find((item) => String(item.id) === String(documentId))
  if (!recibo) return null

  const apenado =
    listarApenados().find((item) => String(item.id) === String(recibo.apenadoId)) || null
  const processo = findProcess(recibo.processoId, tenantId)

  const reciboComWhiteLabel = receiptConfig
    ? { ...recibo, configuracaoInstituicao: receiptConfig }
    : recibo

  return {
    apenado,
    processo,
    recibo: reciboComWhiteLabel,
    mudancasDetectadas: recibo.alteracoesRastreadas || {},
  }
}

export function readViewPreference() {
  return readJson(VIEW_PREFERENCE_STORAGE_KEY, DEFAULT_VIEW)
}

export function saveViewPreference(view) {
  writeJson(VIEW_PREFERENCE_STORAGE_KEY, view)
  return view
}
