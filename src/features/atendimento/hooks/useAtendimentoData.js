import { useMemo, useSyncExternalStore } from 'react'
import { listarApenados } from '@/features/apenados'
import {
  listarComprovantes,
  observarComprovantes,
  obterSnapshotComprovantes,
} from '@/features/atendimento'
import { useSession } from '@/features/autenticacao/context/sessionContext'

export const useAtendimentoData = () => {
  const { session } = useSession()
  const comarca = session?.tenant?.id

  const apenados = useMemo(() => {
    if (!comarca) return []

    return listarApenados().filter((apenado) => apenado.tenantId === comarca)
  }, [comarca])

  useSyncExternalStore(observarComprovantes, obterSnapshotComprovantes)

  const presencas = useMemo(() => {
    if (!comarca) return []
    return listarComprovantes(comarca)
  }, [comarca])

  return { apenados, presencas }
}
