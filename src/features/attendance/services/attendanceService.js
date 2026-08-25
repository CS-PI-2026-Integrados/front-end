import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import {
  COMPROVANTES_STORAGE_KEY,
  comprovantesIniciais,
} from '@/features/attendance/mock/receiptsMock'

const listeners = new Set()
let comprovantesCache

async function fileToDataUrl(file) {
  if (!(file instanceof File))
    throw new Error('Capture ou selecione uma foto para gerar o comprovante')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Não foi possível processar a foto selecionada.'))
    reader.readAsDataURL(file)
  })
}

function obterComprovantes() {
  if (!comprovantesCache) {
    comprovantesCache = readJson(COMPROVANTES_STORAGE_KEY, comprovantesIniciais)
  }
  return comprovantesCache
}

export function listarComprovantes(tenantId) {
  const comprovantes = obterComprovantes()
  return tenantId ? comprovantes.filter((item) => item.tenantId === tenantId) : comprovantes
}

export function salvarComprovante(comprovante) {
  comprovantesCache = [comprovante, ...obterComprovantes()]
  writeJson(COMPROVANTES_STORAGE_KEY, comprovantesCache)
  listeners.forEach((listener) => listener())
  return comprovante
}

export async function gerarComprovante({
  apenado,
  processo,
  photoFile,
  mudancasDetectadas = {},
  operatorName,
  institution,
}) {
  if (!apenado) throw new Error('Selecione um apenado para continuar')
  if (apenado.processos?.length && !processo)
    throw new Error('Selecione um processo para continuar')

  const emitidoEm = new Date().toISOString()
  const photoUrl = await fileToDataUrl(photoFile)
  return salvarComprovante({
    id: `${Date.now()}`,
    apenadoId: apenado.id,
    tenantId: apenado.tenantId,
    processoId: processo?.id,
    nomeApenado: apenado.nomeCompleto,
    cpfApenado: apenado.cpf,
    photoUrl,
    emitidoEm,
    nomeOperador: operatorName,
    codigoVerificacao: `COMP-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
    alteracoesRastreadas: Object.fromEntries(
      Object.entries(mudancasDetectadas).filter(([, change]) => change.mudou)
    ),
    configuracaoInstituicao: institution,
  })
}

export function obterSnapshotComprovantes() {
  return obterComprovantes()
}

export function observarComprovantes(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
