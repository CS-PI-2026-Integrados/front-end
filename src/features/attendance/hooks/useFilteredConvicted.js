import { useMemo } from 'react'

export function useFilteredConvicted(apenados, search) {
  const limit = 5
  return useMemo(() => {
    if (!apenados || apenados.length === 0) return []

    const s = search ? search.toLowerCase().trim() : ''
    const sDigits = s.replace(/\D/g, '')
    const resultados = []

    if (!s) {
      const max = Math.min(apenados.length, limit)
      for (let i = 0; i < max; i++) {
        resultados.push(apenados[i])
      }
      return resultados
    }

    for (const a of apenados) {
      const nome = (a.fullName || '').toLowerCase()
      const matchesNome = nome.includes(s)

      const cpf = (a.cpf || '').toLowerCase()
      const cpfDigits = (a.cpf || '').replace(/\D/g, '')
      const matchesCpf = cpf.includes(s) || (sDigits.length >= 2 && cpfDigits.includes(sDigits))

      const procs = [a.processNumber, ...(a.processos || []).map((p) => p.processNumber)].filter(
        Boolean
      )

      const matchesProcess = procs.some((proc) => {
        const lower = String(proc).toLowerCase()
        if (lower.includes(s)) return true
        if (sDigits.length >= 2) {
          const clean = String(proc).replace(/\D/g, '')
          if (clean.includes(sDigits)) return true
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
