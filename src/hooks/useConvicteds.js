import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { getStoredApenados, STORAGE_KEY } from '@/utils/apenadosUtils'

const ITEMS_PER_PAGE = 10

export function useConvicteds(comarcaId) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [apenados, setApenados] = useState(getStoredApenados)

  const [apenadoInativar, setApenadoInativar] = useState(null)
  const [apenadoEditar, setApenadoEditar] = useState(null)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)
  const [apenadoDocumentos, setApenadoDocumentos] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apenados))
  }, [apenados])

  const filtered = useMemo(() => {
    if (!comarcaId) return []
    const term = search.toLowerCase().trim()
    if (!term) {
      return apenados.filter((item) => item.tenant_id === comarcaId || item.tenantId === comarcaId)
    }

    const cleanTerm = term.replace(/\D/g, '')

    return apenados
      .filter((item) => item.tenant_id === comarcaId || item.tenantId === comarcaId)
      .filter((a) => {
        const matchNome = (a.nome || a.fullName || '').toLowerCase().includes(term)

        const cleanCPF = (a.cpf || '').replace(/\D/g, '')
        const matchCPF =
          (a.cpf || '').toLowerCase().includes(term) ||
          (cleanTerm.length >= 2 && cleanCPF.includes(cleanTerm))

        const procs = [
          a.numero_processo,
          a.processNumber,
          a.numeroProcesso,
          ...(a.processos || []).map((p) => p.processNumber || p.numeroProcesso),
        ].filter(Boolean)

        const matchProcesso = procs.some((proc) => {
          const lowerProc = String(proc).toLowerCase()
          if (lowerProc.includes(term)) return true
          if (cleanTerm.length >= 2) {
            const cleanProc = String(proc).replace(/\D/g, '')
            if (cleanProc.includes(cleanTerm)) return true
          }
          return false
        })

        return matchNome || matchCPF || matchProcesso
      })
  }, [comarcaId, search, apenados])

  const processCounts = useMemo(() => {
    if (!comarcaId) return {}
    const counts = {}
    apenados
      .filter((item) => item.tenant_id === comarcaId)
      .forEach((a) => {
        const proc = (a.numero_processo || '').trim()
        if (proc) {
          counts[proc] = (counts[proc] || 0) + 1
        }
      })
    return counts
  }, [comarcaId, apenados])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const visiblePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE)

  function handleInativar() {
    setApenados((prev) =>
      prev.map((a) => (a.id === apenadoInativar.id ? { ...a, status: 'Inativo' } : a))
    )
    setApenadoInativar(null)
    toast.success('Apenado inativado com sucesso!')
  }

  function handleSalvar(form) {
    if (apenadoEditar) {
      setApenados((prev) => prev.map((a) => (a.id === form.id ? { ...form } : a)))
      setApenadoEditar(null)
      toast.success('Apenado atualizado com sucesso!')
    } else {
      setApenados((prev) => [...prev, form])
      setModalCadastroAberto(false)
      toast.success('Apenado cadastrado com sucesso!')
    }
  }

  return {
    state: {
      search,
      currentPage,
      apenados,
      apenadoInativar,
      apenadoEditar,
      modalCadastroAberto,
      apenadoDocumentos,
      totalPages,
      visiblePage,
      paginated,
      filtered,
      processCounts,
    },
    actions: {
      setSearch,
      setCurrentPage,
      setApenadoInativar,
      setApenadoEditar,
      setModalCadastroAberto,
      setApenadoDocumentos,
      handleInativar,
      handleSalvar,
    },
  }
}
