import { useEffect, useState } from 'react'
import { useSession } from '@/features/authentication'
import { getConvictedSchedule } from '../services/convictedScheduleService'

export function useConvictedSchedule(id, from, to) {
  const { session } = useSession()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState(null)
  const key = JSON.stringify([session?.user?.id, session?.tenant?.id, id, from, to, attempt])

  useEffect(() => {
    const controller = new AbortController()
    getConvictedSchedule({ id, from, to }, { signal: controller.signal })
      .then((events) => {
        if (!controller.signal.aborted) setState({ key, events, isLoading: false })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ key, error: true, events: [], isLoading: false })
      })
    return () => controller.abort()
  }, [id, from, to, key])

  const current = state?.key === key ? state : { events: [], isLoading: true }
  return { ...current, retry: () => setAttempt((value) => value + 1) }
}
