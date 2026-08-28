import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { APENADOS_STORAGE_KEY, apenadosIniciais } from '@/features/convicteds/mock/convictedsMock'

export function listarApenados() {
  return readJson(APENADOS_STORAGE_KEY, apenadosIniciais)
}

export function salvarApenados(apenados) {
  writeJson(APENADOS_STORAGE_KEY, apenados)
  return apenados
}
