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

    const cleanTerm = s.replace(/\D/g, '')
    for (const a of apenados) {
      const matchesNome = (a.fullName || a.nome)?.toLowerCase().includes(s)

      const cleanCpf = (a.cpf || '').replace(/\D/g, '')
      const matchesCpf =
        (a.cpf || '').toLowerCase().includes(s) ||
        (cleanTerm.length >= 2 && cleanCpf.includes(cleanTerm))

      const procs = [
        a.numero_processo,
        a.processNumber,
        a.numeroProcesso,
        ...(a.processos || []).map((p) => p.processNumber || p.numeroProcesso),
      ].filter(Boolean)

      const matchesProcess = procs.some((proc) => {
        const lowerProc = String(proc).toLowerCase()
        if (lowerProc.includes(s)) return true
        if (cleanTerm.length >= 2) {
          const cleanProc = String(proc).replace(/\D/g, '')
          if (cleanProc.includes(cleanTerm)) return true
        }
        return false
      })

      if (matchesNome || matchesCpf || matchesProcess) {
        resultados.push(a)
      }

      if (resultados.length === limit) break
    }
    return resultados
  }, [apenados, search, limit])
}
