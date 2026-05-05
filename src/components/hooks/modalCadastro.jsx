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

function validarCPF(cpf) {
  const nums = cpf.replace(/\D/g, '')
  if (nums.length !== 11) return false
  if (/^(\d)\1+$/.test(nums)) return false
  return true
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function ModalCadastro({ onSalvar, onCancelar }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validar() {
    const erros = {}
    if (!form.nome.trim()) erros.nome = 'O nome é obrigatório'
    if (!form.cpf || form.cpf.replace(/\D/g, '').length < 11) {
      erros.cpf = 'O CPF é obrigatório'
    } else if (!validarCPF(form.cpf)) {
      erros.cpf = 'CPF inválido'
    }
    return erros
  }

  function handleSalvar() {
    const erros = validar()
    if (Object.keys(erros).length > 0) {
      setErrors(erros)
      return
    }
    onSalvar({ ...form, id: generateUUID() })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-lg font-bold text-green-800">Novo Cadastro de Apenado</h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              name="nome"
              placeholder="Nome e sobrenome"
              className={`w-full rounded border p-2 text-sm ${errors.nome ? 'border-red-400' : 'border-gray-300'}`}
              onChange={handleChange}
            />
            {errors.nome && <p className="mt-0.5 text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              CPF <span className="text-red-500">*</span>
            </label>
            <input
              name="cpf"
              placeholder="000.000.000-00"
              className={`w-full rounded border p-2 text-sm ${errors.cpf ? 'border-red-400' : 'border-gray-300'}`}
              onChange={handleChange}
            />
            {errors.cpf && <p className="mt-0.5 text-xs text-red-500">{errors.cpf}</p>}
          </div>

          <select
            name="vara"
            className="rounded border border-gray-300 p-2 text-sm"
            onChange={handleChange}
          >
            <option value="">Selecione a Vara</option>
            {VARAS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            name="sitTrabalhista"
            className="rounded border border-gray-300 p-2 text-sm"
            onChange={handleChange}
          >
            <option value="">Situação Trabalhista</option>
            {SITUACOES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div className="mt-4 flex justify-end gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onCancelar}
              className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSalvar}
              className="rounded bg-green-800 px-5 py-2 text-sm font-semibold text-white hover:bg-green-900"
            >
              Salvar cadastro
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalCadastro
