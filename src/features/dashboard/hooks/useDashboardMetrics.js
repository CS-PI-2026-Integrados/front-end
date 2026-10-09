import { useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from '@/features/authentication'
import {
  dashboardService,
  getAttendanceRevision,
  subscribeAttendanceChanges,
} from '../services/dashboardService'

const pending = { data: null, isLoading: true, error: null }

export function useDashboardMetrics() {
  const { session } = useSession()
  const userId = session?.user?.id
  const districtId = session?.tenant?.id
  const revision = useSyncExternalStore(subscribeAttendanceChanges, getAttendanceRevision)
  const key = JSON.stringify([userId, districtId, revision])
  const [state, setState] = useState({})

  useEffect(() => {
    if (!userId || !districtId) return
    const controller = new AbortController()
    let current = true

    async function loadSection(section, fetchMetrics, errorMessage) {
      try {
        const data = await fetchMetrics({ signal: controller.signal })
        if (current)
          setState((previous) => ({
            ...(previous.key === key ? previous : { convicted: pending, attendance: pending }),
            key,
            [section]: { data, isLoading: false, error: null },
          }))
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState((previous) => ({
            ...(previous.key === key ? previous : { convicted: pending, attendance: pending }),
            key,
            [section]: { data: null, isLoading: false, error: errorMessage },
          }))
      }
    }

    void Promise.allSettled([
      loadSection(
        'convicted',
        dashboardService.getConvictedMetrics,
        'Não foi possível carregar os indicadores de apenados.'
      ),
      loadSection(
        'attendance',
        dashboardService.getAttendanceMetrics,
        'Não foi possível carregar os indicadores de atendimentos.'
      ),
    ])
    return () => {
      current = false
      controller.abort()
    }
  }, [userId, districtId, key])

  return state.key === key ? state : { convicted: pending, attendance: pending }
}
