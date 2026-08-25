import { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { presencasStore } from '@/mocks/presenca.mock.js'
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

const Documents = () => {
  const { session } = useSession()
  const tenantId = session?.tenant?.id

  const [abaAtiva, setAbaAtiva] = useState('atendimentos')

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
                      onClick={() => temRegistro && setMesSelecionadoManual(index)}
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
            <p className="font-semibold text-gray-900">
              {MESES_EXTENSO[mesSelecionado]} {anoSelecionado}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {contagemPorMes[mesSelecionado]} documento(s) encontrado(s)
            </p>
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
