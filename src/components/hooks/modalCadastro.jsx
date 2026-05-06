import { useSession } from '@/context/SessionContext'
import { useState, useRef } from 'react'
import { IMaskInput } from 'react-imask'

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
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(nums[9])) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(nums[10])
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

function ModalCadastro({ onSalvar, onCancelar }) {
  const { session } = useSession()
  const comarcaId = session?.tenant?.id
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(null)
  const fileRef = useRef(null)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleMask(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setForm((prev) => ({ ...prev, foto: file }))
    setErrors((prev) => ({ ...prev, foto: '' }))
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function validar() {
    const erros = {}
    if (!form.foto) erros.foto = 'A foto é obrigatória'
    if (!form.nome.trim()) erros.nome = 'O nome é obrigatório'
    if (!form.cpf || form.cpf.replace(/\D/g, '').length < 11) erros.cpf = 'O CPF é obrigatório'
    else if (!validarCPF(form.cpf)) erros.cpf = 'CPF inválido'
    if (!form.dataNascimento) erros.dataNascimento = 'A data de nascimento é obrigatória'
    if (!form.telefone || form.telefone.replace(/\D/g, '').length < 10)
      erros.telefone = 'O telefone é obrigatório'
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
    const novoApenado = {
      id: generateUUID(),
      tenant_id: comarcaId,
      nome: form.nome,
      cpf: form.cpf,
      data_nascimento: form.dataNascimento,
      telefone: form.telefone,
      endereco: form.endereco,
      numero_processo: form.numeroProcesso,
      vara: form.vara,
      instituicao: form.instituicao,
      sit_trabalhista: form.sitTrabalhista,
      status: form.status,
      observacoes: form.observacoes,
      foto: preview,
    }
    onSalvar(novoApenado)
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
          <button
            onClick={onCancelar}
            className="rounded-lg p-1 text-white transition-colors hover:bg-green-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 text-left">
          <p className="mb-3 text-left text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Identificação Pessoal
          </p>

          <div className="mb-4 flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className={`flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50 ${
                  errors.foto ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <>
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                    <span className="mt-1 px-1 text-center text-xs leading-tight text-gray-400">
                      Clique para adicionar
                    </span>
                  </>
                )}
              </button>
              <span className="text-[10px] leading-tight text-gray-400">JPG, PNG — máx. 5 MB</span>
              {errors.foto && (
                <span className="text-[10px] font-medium text-red-500">{errors.foto}</span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFoto}
              />
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3">
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
                <IMaskInput
                  mask="000.000.000-00"
                  value={form.cpf}
                  onAccept={(val) => handleMask('cpf', val)}
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
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={form.telefone}
                  onAccept={(val) => handleMask('telefone', val)}
                  placeholder="(00) 00000-0000"
                  className={inputClass('telefone')}
                />
                {errors.telefone && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.telefone}</p>
                )}
              </div>
            </div>
          </div>

          <p className="mb-3 text-left text-xs font-semibold tracking-widest text-gray-400 uppercase">
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

          <p className="mb-3 text-left text-xs font-semibold tracking-widest text-gray-400 uppercase">
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
                Instituição / Unidade
              </label>
              <input
                name="instituicao"
                value={form.instituicao}
                onChange={handleChange}
                placeholder="Nome da instituição"
                className={inputClass('instituicao')}
              />
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

          <p className="mb-3 text-left text-xs font-semibold tracking-widest text-gray-400 uppercase">
            Status e Observações
          </p>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="flex w-fit overflow-hidden rounded-lg border border-gray-300">
              {['Ativo', 'Inativo'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${
                    form.status === s
                      ? 'bg-green-800 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-2">
            <label className="mb-1 block text-left text-xs font-semibold text-gray-600">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Adicione observações relevantes sobre o apenado..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400">* campos obrigatórios</p>
          <div className="flex gap-3">
            <button
              onClick={onCancelar}
              className="rounded-lg border border-gray-200 px-5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={!form.foto}
              className="rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
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
