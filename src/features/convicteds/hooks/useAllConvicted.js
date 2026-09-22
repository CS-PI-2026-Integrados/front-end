import { useCallback, useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

const PAGE_SIZE = 100
const convictedCache = new Map()

export function useAllConvicted({ cacheKey = 'default' } = {}) {
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [state, setState] = useState({
    ...(convictedCache.get(cacheKey) || { items: [], totalItems: 0 }),
    isLoading: !convictedCache.has(cacheKey),
    error: null,
  })

  const refetch = useCallback(() => {
    convictedCache.delete(cacheKey)
    setReloadTrigger((current) => current + 1)
  }, [cacheKey])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true
    const hasCachedData = convictedCache.has(cacheKey)

    async function loadAllConvicted() {
      setState((current) => ({
        ...current,
        items: hasCachedData ? current.items : [],
        totalItems: hasCachedData ? current.totalItems : 0,
        isLoading: !hasCachedData,
        error: null,
      }))

      try {
        const firstPage = await convictedService.list({
          page: 1,
          limit: PAGE_SIZE,
          signal: controller.signal,
        })
        const pages = [firstPage.items]

        for (let page = 2; page <= firstPage.totalPages; page += 1) {
          const nextPage = await convictedService.list({
            page,
            limit: PAGE_SIZE,
            signal: controller.signal,
          })
          pages.push(nextPage.items)
        }

        if (isCurrent) {
          const nextState = {
            items: pages.flat(),
            totalItems: firstPage.totalItems,
            isLoading: false,
            error: null,
          }
          convictedCache.set(cacheKey, {
            items: nextState.items,
            totalItems: nextState.totalItems,
          })
          setState(nextState)
        }
      } catch (error) {
        if (error?.name === 'AbortError' || !isCurrent) return

        setState((current) => ({
          ...current,
          isLoading: false,
          error: 'Não foi possível carregar os apenados.',
        }))
      }
    }

    void loadAllConvicted()

    return () => {
      isCurrent = false
      controller.abort()
    }
  }, [cacheKey, reloadTrigger])

  return { ...state, refetch }
}
