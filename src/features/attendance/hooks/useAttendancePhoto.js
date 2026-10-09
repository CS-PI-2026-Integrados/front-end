import { useEffect, useState } from 'react'
import { useSession } from '@/features/authentication'
import { attendanceService } from '../services/attendanceService'

export function useAttendancePhoto(id) {
  const { session } = useSession()
  const key = JSON.stringify([id, session?.user?.id, session?.tenant?.id])
  const [state, setState] = useState({ key, url: null, isLoading: Boolean(id), error: null })
  if (state.key !== key) {
    setState({ key, url: null, isLoading: Boolean(id), error: null })
  }
  useEffect(() => {
    if (!id) return undefined
    const controller = new AbortController()
    let current = true
    let url
    attendanceService
      .getPhoto(id, { signal: controller.signal })
      .then((blob) => {
        if (!current) return
        url = URL.createObjectURL(blob)
        setState({ id, key, url, isLoading: false, error: null })
      })
      .catch((error) => {
        if (current && error.name !== 'AbortError') {
          setState({ id, key, url: null, isLoading: false, error: error.message })
        }
      })
    return () => {
      current = false
      controller.abort()
      if (url) URL.revokeObjectURL(url)
    }
  }, [id, key])
  return state.key === key ? state : { url: null, isLoading: Boolean(id), error: null }
}
