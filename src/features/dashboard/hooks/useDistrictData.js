import { useMemo, useSyncExternalStore } from 'react'
import { useAllConvicted } from '@/features/convicteds'
import {
  listarComprovantes,
  observarComprovantes,
  obterSnapshotComprovantes,
} from '@/features/attendance'
import { useSession } from '@/features/authentication'

export const useDistrictData = () => {
  const { session } = useSession()
  const comarca = session?.tenant?.id ? String(session.tenant.id) : ''
  const { items: apenados, isLoading, error } = useAllConvicted({ cacheKey: comarca })

  useSyncExternalStore(observarComprovantes, obterSnapshotComprovantes)

  const presencas = useMemo(() => {
    if (!comarca) return listarComprovantes()
    return listarComprovantes(comarca)
  }, [comarca])

  return { apenados, presencas, isLoading, error }
}
