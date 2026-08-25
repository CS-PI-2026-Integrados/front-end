import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import {
  COMPROVANTES_STORAGE_KEY,
  comprovantesIniciais,
} from '@/features/attendance/mock/receiptsMock'

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
  return tenantId ? comprovantes.filter((item) => item.tenantId === tenantId) : comprovantes
}

export function salvarComprovante(comprovante) {
  comprovantesCache = [comprovante, ...obterComprovantes()]
  writeJson(COMPROVANTES_STORAGE_KEY, comprovantesCache)
  listeners.forEach((listener) => listener())
  return comprovante
}

export function obterSnapshotComprovantes() {
  return obterComprovantes()
}

export function observarComprovantes(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
