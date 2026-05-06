import { useMemo } from 'react'

export function useFilteredConvicted(apenados, search) {
  const limit = 5
  return useMemo(() => {
    if (!apenados || apenados.length === 0) return []

    const s = search ? search.toLowerCase() : ''
    const resultados = []

    if (!s) {
      const max = Math.min(apenados.length, limit)
      for (let i = 0; i < max; i++) {
        resultados.push(apenados[i])
      }
      return resultados
    }

    for (const a of apenados) {
      const matchesNome = a.fullName?.toLowerCase().includes(s)
      const matchesCpf = a.cpf?.toLowerCase().includes(s)

      const matchesProcess = a.processos?.some((processo) =>
        processo.processNumber?.toLowerCase().includes(s)
      )

      if (matchesNome || matchesCpf || matchesProcess) {
        resultados.push(a)
      }

      if (resultados.length === limit) break
    }
    return resultados
  }, [apenados, search, limit])
}
