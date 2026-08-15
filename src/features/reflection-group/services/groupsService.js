import gruposIniciais from '@/features/grupos-reflexivos/mock/groupsMock.json'
import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'

const GRUPOS_STORAGE_KEY = 'sicape:grupos-reflexivos:v1'

export function listarGrupos() {
  return readJson(GRUPOS_STORAGE_KEY, gruposIniciais)
}

export function salvarGrupos(grupos) {
  writeJson(GRUPOS_STORAGE_KEY, grupos)
  return grupos
}
