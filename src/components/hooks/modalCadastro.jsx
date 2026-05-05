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
    if (!form.cpf || form.cpf.replace(/\D/g, '').length < 11) erros.cpf = 'O CPF é obrigatório'
    else if (!validarCPF(form.cpf)) erros.cpf = 'CPF inválido'
    if (!form.dataNascimento) erros.dataNascimento = 'A data de nascimento é obrigatória'
    if (!form.endereco.trim()) erros.endereco = 'O endereço é obrigatório'
    if (!form.numeroProcesso.trim()) erros.numeroProcesso = 'O número do processo é obrigatório'
    if (!form.vara) erros.vara = 'A vara é obrigatória'
    if (!form.sitTrabalhista) erros.sitTrabalhista = 'A situação trabalhista é obrigatória'
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

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex items-start justify-between bg-green-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Cadastrar Novo Apenado</h2>
            <p className="text-sm text-green-200">
              Preencha os dados do apenado no formulário abaixo
            </p>
          </div>
          <button onClick={onCancelar} className="rounded-lg p-1 text-white hover:bg-green-700">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Identificação Pessoal
          </p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Nome completo <span className="text-red-500">*</span>
              </label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                placeholder="Nome e sobrenome"
                className={inputClass('nome')}
              />
              {errors.nome && <p className="mt-0.5 text-xs text-red-500">{errors.nome}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                CPF <span className="text-red-500">*</span>
              </label>
              <input
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                className={inputClass('cpf')}
              />
              {errors.cpf && <p className="mt-0.5 text-xs text-red-500">{errors.cpf}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Data de nascimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                className={inputClass('dataNascimento')}
              />
              {errors.dataNascimento && (
                <p className="mt-0.5 text-xs text-red-500">{errors.dataNascimento}</p>
              )}
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Endereço
          </p>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Endereço completo <span className="text-red-500">*</span>
            </label>
            <input
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Rua, número, bairro, cidade — estado"
              className={inputClass('endereco')}
            />
            {errors.endereco && <p className="mt-0.5 text-xs text-red-500">{errors.endereco}</p>}
          </div>

          <p className="mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Situação Judicial e Laboral
          </p>
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Número do processo <span className="text-red-500">*</span>
              </label>
              <input
                name="numeroProcesso"
                value={form.numeroProcesso}
                onChange={handleChange}
                placeholder="0000000-00.0000.0.00.0000"
                className={inputClass('numeroProcesso')}
              />
              {errors.numeroProcesso && (
                <p className="mt-0.5 text-xs text-red-500">{errors.numeroProcesso}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">
                Vara <span className="text-red-500">*</span>
              </label>
              <select
                name="vara"
                value={form.vara}
                onChange={handleChange}
                className={inputClass('vara')}
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
                Situação trabalhista <span className="text-red-500">*</span>
              </label>
              <select
                name="sitTrabalhista"
                value={form.sitTrabalhista}
                onChange={handleChange}
                className={inputClass('sitTrabalhista')}
              >
                <option value="">Selecione</option>
                {SITUACOES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.sitTrabalhista && (
                <p className="mt-0.5 text-xs text-red-500">{errors.sitTrabalhista}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400">* campos obrigatórios</p>
          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white hover:bg-green-900"
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
