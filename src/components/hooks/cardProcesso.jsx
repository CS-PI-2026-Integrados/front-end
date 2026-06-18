import { useState } from 'react'

function CardProcesso({ processo, index }) {
  const isEncerrado = processo.status === 'ENCERRADO'
  const [aberto, setAberto] = useState(!isEncerrado)

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isEncerrado ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'
      }`}
    >
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${aberto ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {processo.numeroProcesso || `Processo ${index + 1}`}
            </p>
            <p className="text-xs text-gray-400">
              {processo.vara || 'Vara não definida'} · {processo.tipoPena || 'Tipo não definido'}
            </p>
          </div>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
            isEncerrado
              ? 'border border-gray-200 bg-gray-100 text-gray-500'
              : 'border border-green-200 bg-green-100 text-green-700'
          }`}
        >
          {isEncerrado ? 'ENCERRADO' : 'ATIVO'}
        </span>
      </button>

      {aberto && <div className="border-t border-gray-100 px-4 py-3"></div>}
    </div>
  )
}

export default CardProcesso
