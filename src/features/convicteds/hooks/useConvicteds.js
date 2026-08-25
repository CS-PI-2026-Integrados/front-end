import { useCallback, useMemo, useState } from 'react'
import { listarApenados, salvarApenados } from '@/features/convicteds/services/convictedService'

export function useApenados(tenantId) {
  const [apenados, setApenados] = useState(listarApenados)

  const atualizar = useCallback((proximo) => {
    setApenados(proximo)
    salvarApenados(proximo)
  }, [])

  const filtrar = useCallback(
    (busca, situacao) => {
      const termo = (busca || '').trim().toLowerCase()
      const cpfTermo = termo.replace(/\D/g, '')

      return apenados
        .filter((a) => {
          if (!tenantId) return true
          return String(a.tenantId) === String(tenantId) || String(a.tenant_id) === String(tenantId)
        })
        .filter((a) => {
          if (situacao && situacao !== 'todos' && a.situacao !== situacao) return false
          if (!termo) return true

          const matchNome = (a.nomeCompleto || a.nome || a.fullName || '')
            .toLowerCase()
            .includes(termo)

          const cleanCpf = (a.cpf || '').replace(/\D/g, '')
          const matchCpf =
            (a.cpf || '').toLowerCase().includes(termo) ||
            (cpfTermo.length >= 2 && cleanCpf.includes(cpfTermo))

          const procs = [
            a.numeroProcesso,
            a.processNumber,
            a.numero_processo,
            ...(a.processos || []).map((p) => p.processNumber || p.numeroProcesso),
          ].filter(Boolean)

          const matchProcesso = procs.some((proc) => {
            const lower = String(proc).toLowerCase()
            if (lower.includes(termo)) return true
            if (cpfTermo.length >= 2) {
              const cleanProc = String(proc).replace(/\D/g, '')
              if (cleanProc.includes(cpfTermo)) return true
            }
            return false
          })

          return matchNome || matchCpf || matchProcesso
        })
    },
    [apenados, tenantId]
  )

  const processCounts = useMemo(() => {
    if (!tenantId) return {}
    const counts = {}
    apenados
      .filter(
        (a) => String(a.tenantId) === String(tenantId) || String(a.tenant_id) === String(tenantId)
      )
      .forEach((a) => {
        const proc = (a.numeroProcesso || a.numero_processo || a.processNumber || '').trim()
        if (proc) {
          counts[proc] = (counts[proc] || 0) + 1
        }
      })
    return counts
  }, [apenados, tenantId])

  return { apenados, atualizar, filtrar, processCounts }
}
