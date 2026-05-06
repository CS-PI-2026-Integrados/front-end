import { useMemo } from 'react'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { mockPresenca } from '@/mocks/presenca.mock.js'
import { mockProcessos } from '@/mocks/processos.mock.js'
import { useSession } from '@/context/SessionContext.jsx'

export const useDistrictData = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id

  const apenados = useMemo(() => {
    if (!tenantId) return []

    const baseApenados = (mockApenados.apenados || []).filter((a) => a.tenantId === tenantId)
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
  }, [tenantId])

  const presencas = useMemo(() => {
    if (!tenantId) return []
    return (mockPresenca.presencas || []).filter((p) => p.tenantId === tenantId)
  }, [tenantId])

  return { apenados, presencas }
}
