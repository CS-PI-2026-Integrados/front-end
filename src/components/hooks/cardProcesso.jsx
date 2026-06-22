import { useState } from 'react'

const VARAS = ['Vara criminal', 'Juizado criminal', 'Execução meio aberto', 'Execução meio fechado']

const TIPOS_PENA = [
  'Comparecimento Periódico',
  'Prestação de Serviço à Comunidade',
  'Grupo Reflexivo',
  'Restrição de Fim de Semana',
  'Outra',
]

function CardProcesso({ processo, index, onChange, onEncerrar, errors = {} }) {
  const isEncerrado = processo.status === 'ENCERRADO'
  const [aberto, setAberto] = useState(!isEncerrado)

  function handleChange(e) {
    const { name, value } = e.target
    onChange(index, { ...processo, [name]: value })
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
    }`

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

      {aberto && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Número do processo <span className="text-red-500">*</span>
              </label>
              <input
                name="numeroProcesso"
                value={processo.numeroProcesso}
                onChange={handleChange}
                disabled={isEncerrado}
                placeholder="0000000-00.0000.0.00.0000"
                className={`${inputClass('numeroProcesso')} ${isEncerrado ? 'cursor-not-allowed bg-gray-100' : ''}`}
              />
              {errors.numeroProcesso && (
                <p className="mt-0.5 text-xs text-red-500">{errors.numeroProcesso}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Vara vinculada <span className="text-red-500">*</span>
              </label>
              <select
                name="vara"
                value={processo.vara}
                onChange={handleChange}
                disabled={isEncerrado}
                className={`${inputClass('vara')} ${isEncerrado ? 'cursor-not-allowed bg-gray-100' : ''}`}
              >
                <option value="">Selecione</option>
                {VARAS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {errors.vara && <p className="mt-0.5 text-xs text-red-500">{errors.vara}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Tipo de pena <span className="text-red-500">*</span>
              </label>
              <select
                name="tipoPena"
                value={processo.tipoPena}
                onChange={handleChange}
                disabled={isEncerrado}
                className={`${inputClass('tipoPena')} ${isEncerrado ? 'cursor-not-allowed bg-gray-100' : ''}`}
              >
                <option value="">Selecione</option>
                {TIPOS_PENA.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.tipoPena && <p className="mt-0.5 text-xs text-red-500">{errors.tipoPena}</p>}
            </div>
          </div>

          {!isEncerrado && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => onEncerrar(index)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                Encerrar processo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CardProcesso
