import { useCallback, useState } from 'react'
import { listarApenados, salvarApenados } from '@/features/apenados/services/apenadosService'

export function useApenados(_tenantId) {
  const [apenados, setApenados] = useState(listarApenados)
  const atualizar = useCallback((proximo) => {
    setApenados(proximo)
    salvarApenados(proximo)
  }, [])
  return { apenados, atualizar }
}
