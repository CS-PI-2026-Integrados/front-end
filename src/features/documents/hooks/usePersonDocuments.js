import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  listDocuments,
  subscribeAttendanceChanges,
  getAttendanceRevision,
} from '../services/documentsService'

export function usePersonDocuments(person) {
  const convictedId = person?.convictedId ?? person?.id ?? null
  const search = person?.convictedName ?? ''
  const revision = useSyncExternalStore(subscribeAttendanceChanges, getAttendanceRevision)
  const key = JSON.stringify([convictedId, search, revision])

  const [state, setState] = useState({ key: null, comprovantes: [], error: null })

  useEffect(() => {
    if (!convictedId) return
    const controller = new AbortController()
    let current = true

    listDocuments({ search, page: 0, size: 100, signal: controller.signal })
      .then((page) => {
        if (!current) return
        const comprovantes = page.items.filter(
          (item) => String(item.convictedId) === String(convictedId)
        )
        setState({ key, comprovantes, error: null })
      })
      .catch((error) => {
        if (current && error.name !== 'AbortError')
          setState({ key, comprovantes: [], error: error.message })
      })

    return () => {
      current = false
      controller.abort()
    }
  }, [convictedId, search, revision, key])

  const ready = state.key === key

  return {
    comprovantes: ready ? state.comprovantes : [],
    isLoading: Boolean(convictedId) && !ready,
    error: ready ? state.error : null,
  }
}
