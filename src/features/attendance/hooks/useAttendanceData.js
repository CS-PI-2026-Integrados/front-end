import { useMemo, useSyncExternalStore } from 'react'
import { listarApenados } from '@/features/convicteds'
import {
  listarComprovantes,
  observarComprovantes,
  obterSnapshotComprovantes,
} from '@/features/attendance'
import { useSession } from '@/features/authentication/context/sessionContext'

export const useAtendimentoData = () => {
  const { session } = useSession()
  const comarca = session?.tenant?.id ? String(session.tenant.id) : ''

  const apenados = useMemo(() => {
    if (!comarca) return listarApenados()

    return listarApenados().filter((apenado) => String(apenado.tenantId) === comarca)
  }, [comarca])

  useSyncExternalStore(observarComprovantes, obterSnapshotComprovantes)

  const presencas = useMemo(() => {
    if (!comarca) return listarComprovantes()
    return listarComprovantes(comarca)
  }, [comarca])

  return { apenados, presencas }
}
