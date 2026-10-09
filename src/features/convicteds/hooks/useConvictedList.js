import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@/features/authentication'
import { convictedService } from '../services/convictedService'

const emptyState = { items: [], totalItems: 0, totalPages: 1, isLoading: true, error: null }
export function useConvictedList({
  search = '',
  status,
  page = 1,
  limit = 25,
  enabled = true,
  onPageOutOfRange,
} = {}) {
  const { session } = useSession()
  const [reloadId, setReloadId] = useState(0)
  const key = JSON.stringify([
    session?.user?.id,
    session?.tenant?.id,
    search,
    status,
    page,
    limit,
    reloadId,
    enabled,
  ])
  const [state, setState] = useState(emptyState)
  const refetch = useCallback(() => setReloadId((value) => value + 1), [setReloadId])
  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()
    let current = true
    const timer = setTimeout(async () => {
      try {
        const result = await convictedService.list({
          search,
          status,
          page: page - 1,
          size: limit,
          signal: controller.signal,
        })
        if (current) {
          setState({ ...result, key, isLoading: false, error: null })
          if (page > Math.max(1, result.totalPages)) {
            onPageOutOfRange?.(Math.max(1, result.totalPages))
          }
        }
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState({ ...emptyState, key, isLoading: false, error: error.message })
      }
    }, 250)
    return () => {
      current = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, status, page, limit, key, enabled, onPageOutOfRange])
  return {
    ...(enabled ? (state.key === key ? state : emptyState) : { ...emptyState, isLoading: false }),
    refetch,
  }
}
