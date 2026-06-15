import { useMemo, useSyncExternalStore } from 'react'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { presencasStore } from '@/mocks/presenca.mock.js'
import { mockProcessos } from '@/mocks/processos.mock.js'
import { useSession } from '@/context/SessionContext.jsx'

export const useDistrictData = () => {
  const { session } = useSession()
  const comarca = session?.tenant?.id

  const apenados = useMemo(() => {
    if (!comarca) return []

    const baseApenados = (mockApenados.apenados || []).filter((a) => a.tenantId === comarca)
    const processosAtuais = mockProcessos.processos || []

    const processosPorApenado = processosAtuais.reduce((acc, processo) => {
      if (!acc[processo.apenadoId]) {
        acc[processo.apenadoId] = []
      }
      acc[processo.apenadoId].push(processo)
      return acc
    }, {})

    return baseApenados.map((apenado) => {
      return {
        ...apenado,
        processos: processosPorApenado[apenado.id] || [],
      }
    })
  }, [comarca])

  const todasPresencas = useSyncExternalStore(presencasStore.subscribe, presencasStore.getSnapshot)

  const presencas = useMemo(() => {
    if (!comarca) return []
    return todasPresencas.filter((p) => p.tenantId === comarca)
  }, [comarca, todasPresencas])

  return { apenados, presencas }
}
