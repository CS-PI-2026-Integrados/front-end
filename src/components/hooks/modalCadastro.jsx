import { useState } from 'react'

const VARAS = ['Vara criminal', 'Juizado criminal', 'Execução meio aberto', 'Execução meio fechado']
const SITUACOES = ['Trabalho Registrado', 'Trabalho Informal', 'Nao Trabalha']

const INITIAL_FORM = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  endereco: '',
  numeroProcesso: '',
  vara: '',
  instituicao: '',
  sitTrabalhista: '',
  status: 'Ativo',
  observacoes: '',
  foto: null,
}

function ModalCadastro({ onSalvar, onCancelar }) {
  const [form, setForm] = useState(INITIAL_FORM)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-bold text-green-800">Novo Cadastro de Apenado</h2>

        <div className="grid grid-cols-1 gap-4">
          <input
            name="nome"
            placeholder="Nome completo"
            className="rounded border p-2"
            onChange={handleChange}
          />
          <input
            name="cpf"
            placeholder="CPF"
            className="rounded border p-2"
            onChange={handleChange}
          />

          <select name="vara" className="rounded border p-2" onChange={handleChange}>
            <option value="">Selecione a Vara</option>
            {VARAS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select name="sitTrabalhista" className="rounded border p-2" onChange={handleChange}>
            <option value="">Situação Trabalhista</option>
            {SITUACOES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancelar}
              className="rounded px-4 py-2 text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => onSalvar({ ...form, id: Math.random() })}
              className="rounded bg-green-800 px-5 py-2 text-white hover:bg-green-900"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalCadastro
