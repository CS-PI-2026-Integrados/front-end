import { useSession } from '@/features/authentication'
import { useEffect, useState, useSyncExternalStore } from 'react'
import {
  convictedService,
  getPhotoRevision,
  subscribePhotoChanges,
} from '@/features/convicteds/services/convictedService'

export function useConvictedPhoto(id) {
  const { session } = useSession()
  const revision = useSyncExternalStore(subscribePhotoChanges, getPhotoRevision)
  const key = JSON.stringify([id, revision, session?.user?.id, session?.tenant?.id])
  const [state, setState] = useState({ id: null, url: null, isLoading: Boolean(id), error: null })

  useEffect(() => {
    if (!id) {
      return undefined
    }

    const controller = new AbortController()
    let objectUrl = null
    let isCurrent = true

    async function loadPhoto() {
      setState({ id, key, url: null, isLoading: true, error: null })
      try {
        const blob = await convictedService.getPhoto(id, { signal: controller.signal })
        const nextObjectUrl = URL.createObjectURL(blob)
        if (!isCurrent) {
          URL.revokeObjectURL(nextObjectUrl)
          return
        }
        objectUrl = nextObjectUrl
        setState({ id, key, url: objectUrl, isLoading: false, error: null })
      } catch (error) {
        if (error?.name === 'AbortError' || !isCurrent) return
        setState({
          id,
          key,
          url: null,
          isLoading: false,
          error: error?.message || 'Foto indisponível.',
        })
      }
    }

    void loadPhoto()

    return () => {
      isCurrent = false
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [id, key])

  return id && state.key === key ? state : { url: null, isLoading: Boolean(id), error: null }
}
