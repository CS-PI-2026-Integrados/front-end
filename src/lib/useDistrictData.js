import { useMemo } from 'react'
import { mockTenants } from '@/mocks/tenants.mock.js'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { mockPresenca } from '@/mocks/presenca.mock.js'
import { useComarca } from '@/context/ComarcaContext.jsx'

export const useDistrictData = () => {
  const { comarca } = useComarca()
  const tenantAtual = useMemo(
    () => mockTenants.tenants.find((t) => t.uuid === comarca) || {},
    [comarca]
  )

  const apenados = useMemo(
    () => (mockApenados.apenados || []).filter((a) => a.tenantId === tenantAtual.id),
    [tenantAtual.id]
  )

  const presencas = useMemo(
    () => (mockPresenca.presencas || []).filter((p) => p.tenantId === tenantAtual.id),
    [tenantAtual.id]
  )
  return { tenantAtual, apenados, presencas }
}
