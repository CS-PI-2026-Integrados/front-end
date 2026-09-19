import { useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

export function useConvictedList({ search, page = 1, limit = 25 }) {
  const [state, setState] = useState({
    items: [],
    totalItems: 0,
    totalPages: 1,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    const controller = new AbortController()
    let isCurrent = true

    async function loadConvicteds() {
      setState((current) => ({ ...current, isLoading: true, error: null }))

      try {
        const result = await convictedService.list({
          search,
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
  }, [limit, page, search])

  return state
}
