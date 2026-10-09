import { useCallback, useEffect, useState } from 'react'
import { useSession } from '@/features/authentication'
import { convictedService } from '../services/convictedService'

export function useConvictedDetail(id) {
  const { session } = useSession()
  const [reloadId, setReloadId] = useState(0)
  const key = JSON.stringify([session?.user?.id, session?.tenant?.id, id, reloadId])
  const [state, setState] = useState({ convicted: null, isLoading: Boolean(id), error: null })
  const refetch = useCallback(() => setReloadId((value) => value + 1), [])
  useEffect(() => {
    if (!id) return undefined
    const controller = new AbortController()
    let current = true
    convictedService
      .getById(id, { signal: controller.signal })
      .then((convicted) => {
        if (current) setState({ key, convicted, isLoading: false, error: null })
      })
      .catch((error) => {
        if (current && error.name !== 'AbortError')
          setState({ key, convicted: null, isLoading: false, error: error.message })
      })
    return () => {
      current = false
      controller.abort()
    }
  }, [id, key])
  return {
    ...(id && state.key === key ? state : { convicted: null, isLoading: Boolean(id), error: null }),
    refetch,
  }
}
