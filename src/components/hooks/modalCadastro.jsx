import { useSession } from '@/context/sessionContext'
import { useState, useRef } from 'react'
import { IMaskInput } from 'react-imask'
import CardProcesso from './cardProcesso'
import ModalAvisoEncerrar from './modalAvisoEncerrar'

const SITUACOES = ['Trabalho Registrado', 'Trabalho Informal', 'Nao Trabalha']

const INITIAL_FORM = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  endereco: '',
  instituicao: '',
  sitTrabalhista: '',
  observacoes: '',
  foto: null,
}

function criarProcessoVazio() {
  return {
    id: crypto.randomUUID(),
    numeroProcesso: '',
    vara: '',
    tipoPena: '',
    status: 'ATIVO',
  }
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
  const [processos, setProcessos] = useState([criarProcessoVazio()])
  const [errors, setErrors] = useState({})
  const [processosErrors, setProcessosErrors] = useState([{}])
  const [preview, setPreview] = useState(null)
  const [indexParaEncerrar, setIndexParaEncerrar] = useState(null)
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
    if (!form.sitTrabalhista) erros.sitTrabalhista = 'A situação trabalhista é obrigatória'

    const errosProcessos = processos.map((p, i) => {
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

    return { erros, errosProcessos }
  }

  function handleSalvar() {
    const { erros, errosProcessos } = validar()
    const temErrosProcessos = errosProcessos.some((e) => Object.keys(e).length > 0)

    if (Object.keys(erros).length > 0 || temErrosProcessos) {
      setErrors(erros)
      setProcessosErrors(errosProcessos)
      return
    }

    const statusApenado = contarProcessosAtivos() > 0 ? 'Ativo' : 'Inativo'

    const novoApenado = {
      id: generateUUID(),
      tenant_id: comarcaId,
      nome: form.nome,
      cpf: form.cpf,
      data_nascimento: form.dataNascimento,
      telefone: form.telefone,
      endereco: form.endereco,
      instituicao: form.instituicao,
      sit_trabalhista: form.sitTrabalhista,
      status: statusApenado,
      observacoes: form.observacoes,
      foto: preview,
      processos: processos,
    }
    onSalvar(novoApenado)
  }

  const inputClass = (field) =>
    `w-full rounded-lg border px-3 py-2 text-sm bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-green-700 ${
      errors[field] ? 'border-red-400 focus:ring-red-400' : 'border-border'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4">
      <ModalAvisoEncerrar
        aberto={indexParaEncerrar !== null}
        onConfirmar={handleConfirmarEncerramento}
        onCancelar={() => setIndexParaEncerrar(null)}
      />

      <div className="bg-card text-card-foreground border-border flex h-dvh max-h-none w-full max-w-2xl flex-col overflow-hidden rounded-none border shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-xl">
        <div className="flex items-start justify-between gap-4 bg-slate-950 px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-lg font-bold text-white">Cadastrar Novo Apenado</h2>
            <p className="text-muted-foreground text-sm">
              Preencha os dados do apenado no formulário abaixo
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Fechar modal"
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-left sm:px-6 sm:py-5">
          <p className="text-muted-foreground mb-3 text-left text-xs font-semibold tracking-widest uppercase">
            Identificação Pessoal
          </p>

          <div className="mb-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => fileRef.current.click()}
                className={`bg-card text-card-foreground flex h-24 w-24 flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors hover:bg-slate-950 ${
                  errors.foto ? 'border-red-400' : 'border-border dark:border-slate-700'
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
                      className="text-muted-foreground h-8 w-8"
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
                    <span className="text-muted-foreground mt-1 px-1 text-center text-xs leading-tight">
                      Clique para adicionar
                    </span>
                  </>
                )}
              </button>
              <span className="text-muted-foreground text-[10px] leading-tight">
                JPG, PNG — máx. 5 MB
              </span>
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

            <div className="grid w-full flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
              <div className="sm:col-span-2">
                <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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

          <p className="text-muted-foreground mb-3 text-left text-xs font-semibold tracking-widest uppercase">
            Endereço
          </p>
          <div className="mb-4">
            <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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

          <p className="text-muted-foreground mb-3 text-left text-xs font-semibold tracking-widest uppercase">
            Processos Vinculados
          </p>
          <div className="mb-4 flex flex-col gap-3">
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
              className="border-border bg-card text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed py-2.5 text-sm font-medium transition-colors hover:border-green-600 hover:bg-green-50 dark:hover:bg-slate-950"
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

          <p className="text-muted-foreground mb-3 text-left text-xs font-semibold tracking-widest uppercase">
            Situação Laboral
          </p>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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
              <label className="text-muted-foreground mb-1 block text-xs font-semibold">
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

          <p className="text-muted-foreground mb-3 text-left text-xs font-semibold tracking-widest uppercase">
            Observações
          </p>
          <div className="mb-2">
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Adicione observações relevantes sobre o apenado..."
              className="border-border bg-card text-card-foreground dark:text-card-foreground w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-green-500"
            />
          </div>
        </div>

        <div className="border-border mt-auto flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <p className="text-muted-foreground text-xs">* campos obrigatórios</p>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onCancelar}
              className="border-border bg-card text-muted-foreground w-full rounded-lg border px-5 py-2 text-sm transition-colors hover:bg-slate-50 sm:w-auto dark:hover:bg-slate-950"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvar}
              disabled={!form.foto}
              className="w-full rounded-lg bg-green-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
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
