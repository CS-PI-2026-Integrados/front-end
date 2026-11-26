import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from '@/features/authentication'
import {
  attendanceService,
  getAttendanceRevision,
  subscribeAttendanceChanges,
  subscribeReceiptChanges,
  getReceiptRevision,
} from '../services/attendanceService'

export function useAttendanceList({
  convicted,
  convictedId = convicted?.id,
  search = '',
  page = 1,
  size = 5,
  all = false,
} = {}) {
  const { session } = useSession()
  const scope = `${session?.user?.id || ''}:${session?.tenant?.id || ''}`
  const revision = useSyncExternalStore(subscribeAttendanceChanges, getAttendanceRevision)
  const receiptRevision = useSyncExternalStore(subscribeReceiptChanges, getReceiptRevision)
  const [reloadId, setReloadId] = useState(0)
  const [state, setState] = useState({
    items: [],
    totalItems: 0,
    totalPages: 1,
    isLoading: true,
    error: null,
  })
  const queryKey = JSON.stringify([scope, convictedId, search, page, size, all])
  const key = JSON.stringify([queryKey, revision, receiptRevision, reloadId])
  const reload = useCallback(() => setReloadId((value) => value + 1), [setReloadId])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    const timer = setTimeout(async () => {
      try {
        const result = all
          ? await attendanceService.listAll({ signal: controller.signal })
          : await attendanceService.list({
              convicted,
              convictedId,
              search,
              page: page - 1,
              size,
              signal: controller.signal,
            })
        if (current)
          setState({ ...result, key, queryKey, isLoading: false, error: null, refreshError: null })
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState((previous) =>
            previous.queryKey === queryKey && !previous.error
              ? {
                  ...previous,
                  key,
                  refreshError:
                    'Não foi possível atualizar a disponibilidade dos comprovantes. Os dados exibidos foram mantidos.',
                }
              : {
                  key,
                  queryKey,
                  items: [],
                  totalItems: 0,
                  totalPages: 1,
                  isLoading: false,
                  error: error.message,
                }
          )
      }
    }, 250)
    return () => {
      current = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [convicted, convictedId, search, page, size, all, key, queryKey])
  const result =
    state.queryKey === queryKey
      ? state
      : { items: [], totalItems: 0, totalPages: 1, isLoading: true, error: null }
  return { ...result, totalPages: Math.max(1, result.totalPages), reload }
}
