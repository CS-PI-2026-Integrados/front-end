import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from '@/features/authentication'
import {
  attendanceService,
  getAttendanceRevision,
  subscribeAttendanceChanges,
} from '../services/attendanceService'

export function useAttendanceList({ search = '', page = 1, size = 5, all = false } = {}) {
  const { session } = useSession()
  const scope = `${session?.user?.id || ''}:${session?.tenant?.id || ''}`
  const revision = useSyncExternalStore(subscribeAttendanceChanges, getAttendanceRevision)
  const [reloadId, setReloadId] = useState(0)
  const [state, setState] = useState({
    items: [],
    totalItems: 0,
    totalPages: 1,
    isLoading: true,
    error: null,
  })
  const key = JSON.stringify([scope, search, page, size, all, revision, reloadId])
  const reload = useCallback(() => setReloadId((value) => value + 1), [setReloadId])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    const timer = setTimeout(async () => {
      setState({ items: [], totalItems: 0, totalPages: 1, isLoading: true, error: null })
      try {
        const result = all
          ? await attendanceService.listAll({ signal: controller.signal })
          : await attendanceService.list({
              search,
              page: page - 1,
              size,
              signal: controller.signal,
            })
        if (current) setState({ ...result, key, isLoading: false, error: null })
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState({
            key,
            items: [],
            totalItems: 0,
            totalPages: 1,
            isLoading: false,
            error: error.message,
          })
      }
    }, 250)
    return () => {
      current = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, page, size, all, scope, revision, reloadId, key])
  const result =
    state.key === key
      ? state
      : { items: [], totalItems: 0, totalPages: 1, isLoading: true, error: null }
  return { ...result, totalPages: Math.max(1, result.totalPages), reload }
}
