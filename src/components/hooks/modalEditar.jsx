import { useState } from 'react'
import CardProcesso from './cardProcesso'
import ModalAvisoEncerrar from './modalAvisoEncerrar'

function criarProcessoVazio() {
  return {
    id: crypto.randomUUID(),
    numeroProcesso: '',
    vara: '',
    tipoPena: '',
    status: 'ATIVO',
  }
}

function obterProcessosIniciais(apenado) {
  if (apenado?.processos && apenado.processos.length > 0) {
    return apenado.processos
  }
  if (apenado?.numero_processo || apenado?.vara) {
    return [
      {
        id: crypto.randomUUID(),
        numeroProcesso: apenado.numero_processo || '',
        vara: apenado.vara || '',
        tipoPena: apenado.tipoPena || '',
        status: 'ATIVO',
      },
    ]
  }
  return [criarProcessoVazio()]
}

function ModalEditar({ apenado, onSalvar, onCancelar }) {
  const [form, setForm] = useState(apenado || {})
  const [processos, setProcessos] = useState(() => obterProcessosIniciais(apenado))
  const [processosErrors, setProcessosErrors] = useState([])
  const [indexParaEncerrar, setIndexParaEncerrar] = useState(null)

  if (!apenado) return null

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleProcessoChange(index, processoAtualizado) {
    setProcessos((prev) => prev.map((p, i) => (i === index ? processoAtualizado : p)))
    setProcessosErrors((prev) => {
      const novos = [...prev]
      novos[index] = {}
      return novos
    })
  }

  function handleAdicionarProcesso() {
    setProcessos((prev) => [...prev, criarProcessoVazio()])
    setProcessosErrors((prev) => [...prev, {}])
  }

  function contarProcessosAtivos() {
    return processos.filter((p) => p.status === 'ATIVO').length
  }

  function handlePedirEncerramento(index) {
    const ativos = contarProcessosAtivos()
    if (ativos === 1) {
      setIndexParaEncerrar(index)
    } else {
      encerrarProcesso(index)
    }
  }

  function encerrarProcesso(index) {
    setProcessos((prev) => prev.map((p, i) => (i === index ? { ...p, status: 'ENCERRADO' } : p)))
  }

  function handleConfirmarEncerramento() {
    encerrarProcesso(indexParaEncerrar)
    setIndexParaEncerrar(null)
  }

  function validarProcessos() {
    return processos.map((p, i) => {
      const e = {}
      if (!p.numeroProcesso.trim()) e.numeroProcesso = 'O número do processo é obrigatório'
      else {
        const duplicado = processos.some(
          (outro, j) => j !== i && outro.numeroProcesso.trim() === p.numeroProcesso.trim()
        )
        if (duplicado) e.numeroProcesso = 'Número de processo já vinculado a este apenado.'
      }
      if (!p.vara) e.vara = 'A vara é obrigatória'
      if (!p.tipoPena) e.tipoPena = 'O tipo de pena é obrigatório'
      return e
    })
  }

  function handleSalvar() {
    const errosProcessos = validarProcessos()
    const temErros = errosProcessos.some((e) => Object.keys(e).length > 0)

    if (temErros) {
      setProcessosErrors(errosProcessos)
      return
    }

    const statusApenado = contarProcessosAtivos() > 0 ? 'Ativo' : 'Inativo'

    onSalvar({ ...form, status: statusApenado, processos })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <ModalAvisoEncerrar
        aberto={indexParaEncerrar !== null}
        onConfirmar={handleConfirmarEncerramento}
        onCancelar={() => setIndexParaEncerrar(null)}
      />

      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-6">
        <h2 className="text-lg font-bold text-gray-900">Editar Apenado</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Nome</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">CPF</label>
            <input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Endereço</label>
            <input
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Sit. Trabalhista
            </label>
            <select
              name="sit_trabalhista"
              value={form.sit_trabalhista}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            >
              <option>Trabalho Registrado</option>
              <option>Trabalho Informal</option>
              <option>Nao Trabalha</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Status</label>
            <div className="flex h-[38px] items-center">
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                  contarProcessosAtivos() > 0
                    ? 'border border-green-200 bg-green-100 text-green-700'
                    : 'border border-gray-200 bg-gray-100 text-gray-500'
                }`}
              >
                {contarProcessosAtivos() > 0 ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-5 mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
          Processos Vinculados
        </p>
        <div className="flex flex-col gap-3">
          {processos.map((processo, index) => (
            <CardProcesso
              key={processo.id}
              processo={processo}
              index={index}
              onChange={handleProcessoChange}
              onEncerrar={handlePedirEncerramento}
              errors={processosErrors[index] || {}}
            />
          ))}
          <button
            type="button"
            onClick={handleAdicionarProcesso}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-green-600 hover:text-green-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Adicionar processo
          </button>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSalvar}
            className="w-full rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-900 sm:w-auto"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalEditar
