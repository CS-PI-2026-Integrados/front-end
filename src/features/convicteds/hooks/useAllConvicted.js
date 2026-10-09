import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@/features/authentication'
import { convictedService } from '../services/convictedService'

const initial = { items: [], totalItems: 0, isLoading: true, error: null }
export function useAllConvicted({ cacheKey = 'default' } = {}) {
  const { session } = useSession()
  const [reloadId, setReloadId] = useState(0)
  const key = JSON.stringify([session?.user?.id, session?.tenant?.id, cacheKey, reloadId])
  const [state, setState] = useState(initial)
  const refetch = useCallback(() => setReloadId((value) => value + 1), [setReloadId])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    async function load() {
      try {
        const first = await convictedService.list({ size: 100, signal: controller.signal })
        const items = [...first.items]
        for (let page = 1; page < first.totalPages; page++) {
          const next = await convictedService.list({ page, size: 100, signal: controller.signal })
          items.push(...next.items)
        }
        if (current)
          setState({ key, items, totalItems: first.totalItems, isLoading: false, error: null })
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState({ ...initial, key, isLoading: false, error: error.message })
      }
    }
    void load()
    return () => {
      current = false
      controller.abort()
    }
  }, [key])
  return { ...(state.key === key ? state : initial), refetch }
}
