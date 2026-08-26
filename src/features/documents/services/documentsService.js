import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { listarComprovantes } from '@/features/attendance'
import { listarApenados } from '@/features/convicteds'

const VIEW_PREFERENCE_STORAGE_KEY = 'sicape:documentos:view:v1'
const DEFAULT_VIEW = 'grid'

function toDocument(comprovante) {
  return {
    id: comprovante.id,
    tenantId: comprovante.tenantId,
    convictedId: comprovante.apenadoId,
    processId: comprovante.processoId,
    convictedName: comprovante.nomeApenado,
    convictedCpf: comprovante.cpfApenado,
    photoUrl: comprovante.photoUrl,
    pdfUrl: comprovante.pdfUrl,
    issuedAt: comprovante.emitidoEm,
    operatorName: comprovante.nomeOperador,
    verificationCode: comprovante.codigoVerificacao,
  }
}

function toConvicted(apenado) {
  return {
    id: apenado.id,
    tenantId: apenado.tenantId,
    processes: (apenado.processos || []).map((processo) => ({
      id: processo.id,
      processNumber: processo.numeroProcesso,
    })),
  }
}

export function listDocuments(tenantId) {
  return listarComprovantes(tenantId).map(toDocument)
}

export function listDocumentConvicteds(tenantId) {
  return listarApenados()
    .filter((apenado) => String(apenado.tenantId) === String(tenantId))
    .map(toConvicted)
}

export function readViewPreference() {
  return readJson(VIEW_PREFERENCE_STORAGE_KEY, DEFAULT_VIEW)
}

export function saveViewPreference(view) {
  writeJson(VIEW_PREFERENCE_STORAGE_KEY, view)
  return view
}
