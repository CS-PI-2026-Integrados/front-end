import { useCallback, useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

export function useConvictedList({ search, page = 1, limit = 25, debounceMs = 300 }) {
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [state, setState] = useState({
    items: [],
    totalItems: 0,
    totalPages: 1,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, debounceMs)

    return () => clearTimeout(handler)
  }, [search, debounceMs])

  const refetch = useCallback(() => {
    setReloadTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    async function loadConvicteds() {
      setState((current) => ({ ...current, isLoading: true, error: null }))

      try {
        const result = await convictedService.list({
          search: debouncedSearch,
          page,
          limit,
          signal: controller.signal,
        })

        if (isCurrent) {
          setState({ ...result, isLoading: false, error: null })
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

    void loadConvicteds()

    return () => {
      isCurrent = false
      controller.abort()
    }
  }, [limit, page, debouncedSearch, reloadTrigger])

  return {
    ...state,
    refetch,
  }
}
