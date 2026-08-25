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
    `w-full rounded-lg border px-3 py-2 text-sm bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-green-700 ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-border'
    }`

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isEncerrado ? 'border-border bg-slate-950 opacity-90' : 'border-border bg-card'
      }`}
    >
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`text-muted-foreground h-4 w-4 transition-transform ${aberto ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <p className="text-foreground text-sm font-semibold">
              {processo.processNumber || processo.numeroProcesso || `Processo ${index + 1}`}
            </p>
            <p className="text-muted-foreground text-xs">
              {processo.court || processo.vara || 'Vara não definida'} ·{' '}
              {processo.penaltyType || processo.tipoPena || 'Tipo não definido'}
            </p>
          </div>
        </div>
        <span
          className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
            isEncerrado
              ? 'border-border text-muted-foreground border bg-slate-950'
              : 'border border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-emerald-950 dark:text-emerald-300'
          }`}
        >
          {isEncerrado ? 'ENCERRADO' : 'ATIVO'}
        </span>
      </button>

      {aberto && (
        <div className="border-border border-t px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                Número do processo <span className="text-red-500">*</span>
              </label>
              <input
                name="processNumber"
                value={processo.processNumber || processo.numeroProcesso || ''}
                onChange={handleChange}
                disabled={isEncerrado}
                placeholder="0000000-00.0000.0.00.0000"
                className={`${inputClass('processNumber')} ${isEncerrado ? 'cursor-not-allowed bg-slate-950' : ''}`}
              />
              {(errors.processNumber || errors.numeroProcesso) && (
                <p className="mt-0.5 text-xs text-red-500">
                  {errors.processNumber || errors.numeroProcesso}
                </p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                Vara vinculada <span className="text-red-500">*</span>
              </label>
              <select
                name="court"
                value={processo.court || processo.vara || ''}
                onChange={handleChange}
                disabled={isEncerrado}
                className={`${inputClass('court')} ${isEncerrado ? 'cursor-not-allowed bg-slate-950' : ''}`}
              >
                <option value="">Selecione</option>
                {VARAS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              {(errors.court || errors.vara) && (
                <p className="mt-0.5 text-xs text-red-500">{errors.court || errors.vara}</p>
              )}
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold">
                Tipo de pena <span className="text-red-500">*</span>
              </label>
              <select
                name="penaltyType"
                value={processo.penaltyType || processo.tipoPena || ''}
                onChange={handleChange}
                disabled={isEncerrado}
                className={`${inputClass('penaltyType')} ${isEncerrado ? 'cursor-not-allowed bg-slate-950' : ''}`}
              >
                <option value="">Selecione</option>
                {TIPOS_PENA.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {(errors.penaltyType || errors.tipoPena) && (
                <p className="mt-0.5 text-xs text-red-500">
                  {errors.penaltyType || errors.tipoPena}
                </p>
              )}
            </div>
          </div>

          {!isEncerrado && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => onEncerrar(index)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-950"
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
