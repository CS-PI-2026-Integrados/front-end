import { useEffect, useState } from 'react'
import { searchPeople } from '@/features/quick-search/services/quickSearchService'

const DEBOUNCE_MS = 300

export function useQuickSearch(query) {
  const [state, setState] = useState({ results: [], isLoading: false, error: null })

  useEffect(() => {
    const term = query?.trim() || ''
    if (!term) return undefined

    const controller = new AbortController()
    let isCurrent = true

    const timeoutId = setTimeout(async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }))

      try {
        const results = await searchPeople({
          query: term,
          limit: 10,
          signal: controller.signal,
        })
        if (isCurrent) setState({ results, isLoading: false, error: null })
      } catch (error) {
        if (error?.name === 'AbortError' || !isCurrent) return
        setState({
          results: [],
          isLoading: false,
          error: 'Não foi possível buscar. Tente novamente.',
        })
      }
    }, DEBOUNCE_MS)

    return () => {
      isCurrent = false
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [query])

  if (!query?.trim()) {
    return { results: [], isLoading: false, error: null }
  }

  return state
}
