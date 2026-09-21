import { useEffect, useState } from 'react'
import { processService } from '@/features/convicteds/services/processService'

export function useProcessSearch(query, { enabled = true } = {}) {
  const [state, setState] = useState({ items: [], isLoading: false, error: null })

  useEffect(() => {
    const normalizedQuery = query?.trim() || ''
    if (!enabled || normalizedQuery.length < 3) return undefined

    const controller = new AbortController()
    let isCurrent = true
    const timeoutId = setTimeout(async () => {
      setState((current) => ({ ...current, isLoading: true, error: null }))

      try {
        const result = await processService.search({
          query: normalizedQuery,
          limit: 20,
          signal: controller.signal,
        })
        if (isCurrent) setState({ items: result.items, isLoading: false, error: null })
      } catch (error) {
        if (error?.name === 'AbortError' || !isCurrent) return
        setState({ items: [], isLoading: false, error: 'Não foi possível buscar processos.' })
      }
    }, 250)

    return () => {
      isCurrent = false
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [enabled, query])

  if (!enabled || (query?.trim() || '').length < 3) {
    return { items: [], isLoading: false, error: null }
  }

  return state
}
