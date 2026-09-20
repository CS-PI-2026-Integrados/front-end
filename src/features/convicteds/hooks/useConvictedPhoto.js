import { useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

export function useConvictedPhoto(id) {
  const [state, setState] = useState({ url: null, isLoading: Boolean(id), error: null })

  useEffect(() => {
    if (!id) {
      return undefined
    }

    const controller = new AbortController()
    let objectUrl = null
    let isCurrent = true

    async function loadPhoto() {
      setState({ url: null, isLoading: true, error: null })
      try {
        const blob = await convictedService.getPhoto(id, { signal: controller.signal })
        objectUrl = URL.createObjectURL(blob)
        if (isCurrent) setState({ url: objectUrl, isLoading: false, error: null })
      } catch (error) {
        if (error?.name === 'AbortError' || !isCurrent) return
        setState({ url: null, isLoading: false, error: error?.message || 'Foto indisponível.' })
      }
    }

    void loadPhoto()

    return () => {
      isCurrent = false
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id])

  return id ? state : { url: null, isLoading: false, error: null }
}
