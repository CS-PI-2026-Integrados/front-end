import { useState, useMemo } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  FileText,
  Image,
  Download,
  Search,
} from 'lucide-react'
import { presencasStore } from '@/mocks/presenca.mock.js'
import { mockProcessos } from '@/mocks/processos.mock.js'
import { useSession } from '@/context/sessionContext'

const ABAS = [
  { id: 'atendimentos', label: 'Atendimentos' },
  { id: 'grupos', label: 'Grupos Reflexivos' },
]

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const MESES_EXTENSO = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const VIEW_STORAGE_KEY = 'documentos_view_mode'

function getNumeroProcesso(doc) {
  if (doc.processNumber) return doc.processNumber
  const processo = mockProcessos.processos.find(
    (p) => String(p.apenadoId) === String(doc.apenadoId)
  )
  return processo?.processNumber || '—'
}

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const Documents = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id
  const userId = session?.user?.id || 'default'

  const [abaAtiva, setAbaAtiva] = useState('atendimentos')
  const [busca, setBusca] = useState('')

  const comprovantes = useMemo(() => {
    const todos = presencasStore.getSnapshot() || []
    return todos.filter((p) => String(p.tenantId) === String(tenantId))
  }, [tenantId])

  const anosDisponiveis = useMemo(() => {
    const anos = new Set(comprovantes.map((c) => new Date(c.dateTime).getFullYear()))
    const lista = Array.from(anos).sort((a, b) => b - a)
    return lista.length > 0 ? lista : [new Date().getFullYear()]
  }, [comprovantes])

  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())

  const contagemPorMes = useMemo(() => {
    const contagem = Array(12).fill(0)
    comprovantes
      .filter((c) => new Date(c.dateTime).getFullYear() === anoSelecionado)
      .forEach((c) => {
        const mes = new Date(c.dateTime).getMonth()
        contagem[mes]++
      })
    return contagem
  }, [comprovantes, anoSelecionado])

  const mesMaisRecenteComRegistro = useMemo(() => {
    for (let i = 11; i >= 0; i--) {
      if (contagemPorMes[i] > 0) return i
    }
    return new Date().getMonth()
  }, [contagemPorMes])

  const [mesSelecionadoManual, setMesSelecionadoManual] = useState(null)
  const mesSelecionado =
    mesSelecionadoManual !== null ? mesSelecionadoManual : mesMaisRecenteComRegistro

  const [viewMode, setViewMode] = useState(() => {
    const salvo = localStorage.getItem(`${VIEW_STORAGE_KEY}_${userId}`)
    return salvo || 'grid'
  })

  function handleViewMode(modo) {
    setViewMode(modo)
    localStorage.setItem(`${VIEW_STORAGE_KEY}_${userId}`, modo)
  }

  const documentosDoMes = useMemo(() => {
    return comprovantes.filter((c) => {
      const data = new Date(c.dateTime)
      return data.getFullYear() === anoSelecionado && data.getMonth() === mesSelecionado
    })
  }, [comprovantes, anoSelecionado, mesSelecionado])

  const documentosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim()
    if (!termo) return documentosDoMes

    return documentosDoMes.filter((doc) => {
      const nome = (doc.apenadoName || '').toLowerCase()
      const processo = getNumeroProcesso(doc).toLowerCase()
      return nome.includes(termo) || processo.includes(termo)
    })
  }, [documentosDoMes, busca])

  const temBusca = busca.trim() !== ''

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Arquivo de Documentos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Repositório centralizado de comprovantes e documentos
        </p>
      </div>

      <div className="mb-6 flex gap-2">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${
              abaAtiva === aba.id
                ? 'border border-green-700 bg-white text-green-700 shadow-sm'
                : 'border border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === 'atendimentos' && (
        <>
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <h2 className="font-semibold text-gray-800">Navegação por Período</h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ano:</span>
                <select
                  value={anoSelecionado}
                  onChange={(e) => {
                    setAnoSelecionado(Number(e.target.value))
                    setMesSelecionadoManual(null)
                    setBusca('')
                  }}
                  className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-green-700 focus:outline-none"
                >
                  {anosDisponiveis.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50"
                title="Anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex flex-1 items-center justify-between gap-1">
                {MESES.map((mes, index) => {
                  const total = contagemPorMes[index]
                  const temRegistro = total > 0
                  const isSelecionado = mesSelecionado === index

                  return (
                    <button
                      key={mes}
                      disabled={!temRegistro}
                      onClick={() => {
                        if (temRegistro) {
                          setMesSelecionadoManual(index)
                          setBusca('')
                        }
                      }}
                      className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isSelecionado
                          ? 'bg-green-700 text-white'
                          : temRegistro
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'cursor-not-allowed text-gray-300'
                      }`}
                    >
                      {mes}
                      {temRegistro && (
                        <span
                          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                            isSelecionado ? 'bg-white text-green-700' : 'bg-green-600 text-white'
                          }`}
                        >
                          {total}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <button
                className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-50"
                title="Próximo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900">
                  {MESES_EXTENSO[mesSelecionado]} {anoSelecionado}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {temBusca
                    ? `${documentosFiltrados.length} de ${documentosDoMes.length} documento(s) encontrado(s)`
                    : `${documentosDoMes.length} documento(s) encontrado(s)`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou processo..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-64 rounded-lg border border-gray-300 py-2 pr-4 pl-9 text-sm text-gray-800 focus:border-transparent focus:ring-2 focus:ring-green-700 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => handleViewMode('grid')}
                    className={`rounded-md p-1.5 transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-green-700 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Grade"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleViewMode('lista')}
                    className={`rounded-md p-1.5 transition-colors ${
                      viewMode === 'lista'
                        ? 'bg-green-700 text-white'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                    title="Lista"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {documentosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <FileText className="h-10 w-10 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">
                  {temBusca
                    ? `Nenhum documento encontrado para "${busca}" em ${MESES_EXTENSO[mesSelecionado]} ${anoSelecionado}.`
                    : 'Nenhum documento neste período'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {documentosFiltrados.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-sm"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50">
                        <FileText className="h-5 w-5 text-green-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">{doc.apenadoName}</p>
                        <p className="text-xs text-gray-400">{getNumeroProcesso(doc)}</p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {formatarDataHora(doc.dateTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
                        <Image className="h-3.5 w-3.5" />
                        Foto
                      </button>
                      <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50">
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Processo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Data/Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Operador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentosFiltrados.map((doc) => (
                      <tr
                        key={doc.id}
                        className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">{doc.apenadoName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {getNumeroProcesso(doc)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                          {formatarDataHora(doc.dateTime)}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{doc.operatorName || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                              title="Foto"
                            >
                              <Image className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                              title="PDF"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {abaAtiva === 'grupos' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">...</p>
        </div>
      )}
    </div>
  )
}

export default Documents
