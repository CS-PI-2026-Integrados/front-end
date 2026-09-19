import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import {
  COMPROVANTES_STORAGE_KEY,
  comprovantesIniciais,
} from '@/features/attendance/mock/receiptsMock'
import { compressImage } from '@/shared/lib/image'

const listeners = new Set()
let comprovantesCache

async function processPhoto(file) {
  if (!file) throw new Error('Capture ou selecione uma foto para gerar o comprovante')
  if (typeof file === 'string') {
    if (file.startsWith('data:image/')) {
      try {
        const res = await fetch(file)
        const blob = await res.blob()
        const compressed = await compressImage(blob, 400, 400, 0.7)
        if (compressed) return compressed
      } catch {
        return file
      }
    }
    return file
  }
  if (file instanceof File || file instanceof Blob) {
    try {
      const compressed = await compressImage(file, 400, 400, 0.7)
      if (compressed) return compressed
    } catch {
      // fallback
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Não foi possível processar a foto selecionada.'))
      reader.readAsDataURL(file)
    })
  }
  throw new Error('Capture ou selecione uma foto para gerar o comprovante')
}

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
  mudancasDetectadas = {},
  operatorName,
  institution,
}) {
  if (!apenado) throw new Error('Selecione um apenado para continuar')
  if (apenado.processos?.length && !processo)
    throw new Error('Selecione um processo para continuar')

  const emitidoEm = new Date().toISOString()
  const photoUrl = await processPhoto(photoFile)
  return salvarComprovante({
    id: `${Date.now()}`,
    apenadoId: String(apenado.id),
    tenantId: String(apenado.tenantId || '1'),
    processoId: processo?.id
      ? String(processo.id)
      : apenado.processos?.[0]?.id
        ? String(apenado.processos[0].id)
        : 'p1',
    nomeApenado: apenado.fullName || apenado.nomeCompleto || 'Apenado',
    cpfApenado: apenado.cpf || '',
    photoUrl,
    emitidoEm,
    nomeOperador: operatorName || 'Administrador',
    codigoVerificacao: `COMP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
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
