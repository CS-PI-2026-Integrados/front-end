import gruposIniciais from '@/features/reflection-group/mock/groupsMock.json'
import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'

const GRUPOS_STORAGE_KEY = 'sicape:grupos-reflexivos:v1'

function toCanonicalGroup(group) {
  return {
    ...group,
    situacao: group.situacao ?? group.status ?? 'PLANEJAMENTO',
  }
}

export function listarGrupos() {
  return readJson(GRUPOS_STORAGE_KEY, gruposIniciais).map(toCanonicalGroup)
}

export function salvarGrupos(grupos) {
  const canonicalGroups = grupos.map(toCanonicalGroup)
  writeJson(GRUPOS_STORAGE_KEY, canonicalGroups)
  return canonicalGroups
}
