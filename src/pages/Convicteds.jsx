import React, { useState, useMemo, useEffect } from 'react'
import { useSession } from '@/context/sessionContext'
import mockApenados from '../mocks/apenados.json'
import ModalInative from '../components/hooks/modalInative'
import ModalEditar from '../components/hooks/modalEditar'
import ModalCadastro from '../components/hooks/modalCadastro'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ITEMS_PER_PAGE = 10
const STORAGE_KEY = 'apenados_data_v3'

function maskCPF(cpf) {
  return cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})-(\d{2})/, '***.$2.$3-**')
}

function StatusBadge({ status }) {
  const variants = {
    Ativo: 'bg-green-100 text-green-700 border border-green-200',
    Inativo: 'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${variants[status] || variants.Inativo}`}
    >
      {status}
    </span>
  )
}

function SitTrabalhista({ sit }) {
  const variants = {
    'Trabalho Registrado': 'bg-blue-50 text-blue-600 border border-blue-200',
    'Trabalho Informal': 'bg-orange-50 text-orange-600 border border-orange-200',
    'Nao Trabalha': 'bg-gray-100 text-gray-500 border border-gray-200',
  }
  return (
    <span
      className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${variants[sit] || variants['Nao Trabalha']}`}
    >
      {sit}
    </span>
  )
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <svg
        className="h-12 w-12 text-gray-300"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        viewBox="0 0 24 24"
      >
        <circle cx="11" cy="11" r="8" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
      </svg>
      <p className="text-base font-semibold text-gray-500">Nenhum apenado encontrado</p>
      {query && (
        <p className="text-sm">
          Não há resultados para <strong>&quot;{query}&quot;</strong>. Tente outro termo.
        </p>
      )}
    </div>
  )
}

const Convicteds = () => {
  const { session } = useSession()
  const navigate = useNavigate()
  const comarca = session?.tenant?.id

  const apenadosIniciais = useMemo(() => {
    if (!comarca) return []
    return mockApenados.filter((a) => a.tenant_id === comarca)
  }, [comarca])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)

  const [apenados, setApenados] = useState(() => {
    const salvo = localStorage.getItem(STORAGE_KEY)
    return salvo ? JSON.parse(salvo) : apenadosIniciais
  })

  const [foiInicializado, setFoiInicializado] = useState(() => !!localStorage.getItem(STORAGE_KEY))

  if (!foiInicializado && apenadosIniciais.length > 0) {
    setApenados(apenadosIniciais)
    setFoiInicializado(true)
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apenados))
  }, [apenados])

  const [apenadoInativar, setApenadoInativar] = useState(null)
  const [apenadoEditar, setApenadoEditar] = useState(null)
  const [modalCadastroAberto, setModalCadastroAberto] = useState(false)

  const filtered = useMemo(() => {
    if (!comarca) return []
    const term = search.toLowerCase().trim()

    return apenados
      .filter((item) => item.tenant_id === comarca)
      .filter((a) => {
        const matchStatus = statusFilter === 'Todos' || a.status === statusFilter
        if (!matchStatus) return false

        if (!term) return true

        const matchNome = a.nome.toLowerCase().includes(term)

        const cleanCPF = a.cpf.replace(/\D/g, '')
        const cleanTerm = term.replace(/\D/g, '')
        const matchCPF = cleanTerm !== '' && cleanCPF.includes(cleanTerm)

        return matchNome || matchCPF
      })
  }, [comarca, search, statusFilter, apenados])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  function handleInativar() {
    setApenados((prev) =>
      prev.map((a) => (a.id === apenadoInativar.id ? { ...a, status: 'Inativo' } : a))
    )
    setApenadoInativar(null)
    toast.success('Apenado inativado com sucesso!')
  }

  function handleSalvar(form) {
    setApenados((prev) => prev.map((a) => (a.id === form.id ? { ...form } : a)))
    setApenadoEditar(null)
  }

  function handleCadastrar(novoApenado) {
    setApenados((prev) => [...prev, novoApenado])
    setModalCadastroAberto(false)
    toast.success('Apenado cadastrado com sucesso!')
  }

  return (
    <div className="min-h-screen bg-white">
      <ModalInative
        apenado={apenadoInativar}
        onConfirmar={handleInativar}
        onCancelar={() => setApenadoInativar(null)}
      />
      <ModalEditar
        key={apenadoEditar?.id}
        apenado={apenadoEditar}
        onSalvar={handleSalvar}
        onCancelar={() => setApenadoEditar(null)}
      />
      {modalCadastroAberto && (
        <ModalCadastro
          onSalvar={handleCadastrar}
          onCancelar={() => setModalCadastroAberto(false)}
        />
      )}

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-[32px] leading-tight font-bold tracking-tight text-gray-900">
            Gestão de Apenados
          </h1>
          <p className="mt-2 text-base text-gray-400">Cadastro e gerenciamento de apenados</p>
        </div>

        <button
          onClick={() => setModalCadastroAberto(true)}
          className="flex items-center gap-2 rounded-lg bg-[#065F46] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#047857]"
        >
          <span className="text-xl leading-none">+</span>
          Novo Apenado
        </button>
      </div>

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-0.5 text-sm font-semibold text-gray-700">Filtros</p>
        <p className="mb-4 text-xs text-gray-400">Pesquise e filtre os apenados cadastrados</p>
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-64 flex-1">
            <svg
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-gray-300 py-2.5 pr-4 pl-9 text-sm text-gray-800 focus:border-transparent focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="min-w-40 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-green-700 focus:outline-none"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="px-6 py-5">
          <p className="font-semibold text-gray-900">Apenados Cadastrados</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {filtered.length} registro(s) encontrado(s)
          </p>
        </div>

        {filtered.length === 0 ? (
          <EmptyState query={search} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-b border-gray-100 bg-gray-50">
                    {['Nome', 'Telefone', 'Endereço', 'Sit. Trabalhista', 'Status', 'Ações'].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap text-gray-600"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                    >
                      <td className="min-w-40 px-4 py-3.5">
                        <p className="font-semibold text-gray-900">{a.nome}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{maskCPF(a.cpf)}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">{a.telefone}</td>
                      <td
                        className="max-w-64 truncate px-4 py-3.5 text-gray-600"
                        title={a.endereco}
                      >
                        {a.endereco}
                      </td>
                      <td className="px-4 py-3.5">
                        <SitTrabalhista sit={a.sit_trabalhista} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            title="Visualizar"
                            onClick={() => navigate(`/apenados/${a.id}`)}
                            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.8}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 12h6M9 12a3 3 0 01-3-3V7a2 2 0 012-2h8a2 2 0 012 2v2a3 3 0 01-3 3M9 12v5a2 2 0 002 2h2a2 2 0 002-2v-5"
                              />
                            </svg>
                          </button>
                          <button
                            title="Editar"
                            onClick={() => setApenadoEditar(a)}
                            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.8}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110.414 16H8v-2.414a2 2 0 01.586-1.414z"
                              />
                            </svg>
                          </button>
                          <button
                            title="Inativar"
                            onClick={() => setApenadoInativar(a)}
                            className="rounded p-1.5 text-red-400 transition-colors hover:bg-gray-100"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.8}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3.5 text-xs text-gray-500">
                <span>
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-md border px-3 py-1.5 font-medium transition-colors ${
                        page === currentPage
                          ? 'border-green-800 bg-green-800 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Convicteds
