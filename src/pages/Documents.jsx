import { useState } from 'react'

const ABAS = [
  { id: 'atendimentos', label: 'Atendimentos' },
  { id: 'grupos', label: 'Grupos Reflexivos' },
]

const Documents = () => {
  const [abaAtiva, setAbaAtiva] = useState('atendimentos')

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

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        {abaAtiva === 'atendimentos' && <p className="text-sm text-gray-500">...</p>}
        {abaAtiva === 'grupos' && <p className="text-sm text-gray-500">...</p>}
      </div>
    </div>
  )
}

export default Documents
