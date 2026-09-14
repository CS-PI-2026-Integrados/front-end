import { useCallback, useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

export function useConvictedDetail(id) {
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [state, setState] = useState({
    convicted: null,
    isLoading: Boolean(id),
    error: null,
  })

  const refetch = useCallback(() => {
    setReloadTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!id) {
      return
    }

    const controller = new AbortController()
    let isCurrent = true

    async function loadConvicted() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const data = await convictedService.getById(id, { signal: controller.signal })
        if (isCurrent) {
          setState({ convicted: data, isLoading: false, error: null })
        }
      } catch (err) {
        if (err?.name === 'AbortError' || !isCurrent) return

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err?.message || 'Não foi possível carregar os dados do apenado.',
        }))
      }
    }

    void loadConvicted()

    return () => {
      isCurrent = false
      controller.abort()
    }
  }, [id, reloadTrigger])

  return {
    convicted: id ? state.convicted : null,
    isLoading: id ? state.isLoading : false,
    error: id ? state.error : null,
    refetch,
  }
}
