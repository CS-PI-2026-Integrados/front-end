import { useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

const photoCache = new Map()
const pendingRequests = new Map()

export function invalidateConvictedPhotoCache(id) {
  if (id) {
    const cachedUrl = photoCache.get(id)
    if (cachedUrl) {
      URL.revokeObjectURL(cachedUrl)
      photoCache.delete(id)
    }
    pendingRequests.delete(id)
  } else {
    for (const url of photoCache.values()) {
      URL.revokeObjectURL(url)
    }
    photoCache.clear()
    pendingRequests.clear()
  }
}

export function useConvictedPhoto(id) {
  const [state, setState] = useState(() => {
    if (!id) return { url: null, isLoading: false, error: null }
    if (photoCache.has(id)) {
      return { url: photoCache.get(id), isLoading: false, error: null }
    }
    return { url: null, isLoading: true, error: null }
  })

  useEffect(() => {
    if (!id) {
      setState({ url: null, isLoading: false, error: null })
      return undefined
    }

    if (photoCache.has(id)) {
      setState({ url: photoCache.get(id), isLoading: false, error: null })
      return undefined
    }

    let isCurrent = true
    const controller = new AbortController()

    async function loadPhoto() {
      setState({ url: null, isLoading: true, error: null })

      try {
        let requestPromise = pendingRequests.get(id)
        if (!requestPromise) {
          requestPromise = convictedService
            .getPhoto(id, { signal: controller.signal })
            .then((blob) => {
              const url = URL.createObjectURL(blob)
              photoCache.set(id, url)
              pendingRequests.delete(id)
              return url
            })
            .catch((err) => {
              pendingRequests.delete(id)
              throw err
            })
          pendingRequests.set(id, requestPromise)
        }

        const objectUrl = await requestPromise
        if (isCurrent) {
          setState({ url: objectUrl, isLoading: false, error: null })
        }
      } catch (error) {
        if (error?.name === 'AbortError' || !isCurrent) return
        setState({ url: null, isLoading: false, error: error?.message || 'Foto indisponível.' })
      }
    }

    void loadPhoto()

    return () => {
      isCurrent = false
    }
  }, [id])

  return id ? state : { url: null, isLoading: false, error: null }
}
