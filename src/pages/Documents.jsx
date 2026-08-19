import { useState, useMemo } from 'react'
import { presencasStore } from '@/mocks/presenca.mock.js'
import { useSession } from '@/context/sessionContext'
import { Calendar } from 'lucide-react'

const ABAS = [
  { id: 'atendimentos', label: 'Atendimentos' },
  { id: 'grupos', label: 'Grupos Reflexivos' },
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
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Navegação por Período</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Ano:</span>
              <select
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700"
              >
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
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
