import { useCallback, useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

const PAGE_SIZE = 100

export function useAllConvicted() {
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [state, setState] = useState({
    items: [],
    totalItems: 0,
    isLoading: true,
    error: null,
  })

  const refetch = useCallback(() => {
    setReloadTrigger((current) => current + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    async function loadAllConvicted() {
      setState((current) => ({ ...current, isLoading: true, error: null }))

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
          setState({
            items: pages.flat(),
            totalItems: firstPage.totalItems,
            isLoading: false,
            error: null,
          })
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
  }, [reloadTrigger])

  return { ...state, refetch }
}
