import { useCallback } from 'react'
import { listarGrupos, salvarGrupos } from '@/features/reflection-group/services/groupsService'

export function useGroupsStorage() {
  const loadGroups = useCallback(() => listarGrupos(), [])
  const saveGroups = useCallback((groups) => salvarGrupos(groups), [])
  return { loadGroups, saveGroups }
}
