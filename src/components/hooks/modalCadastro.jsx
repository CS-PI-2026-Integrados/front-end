import { useSession } from '@/context/sessionContext'
import { useState, useRef } from 'react'
import { IMaskInput } from 'react-imask'
import { Search, Upload, X } from 'lucide-react'
import CardProcesso from './cardProcesso'
import ModalAvisoEncerrar from './modalAvisoEncerrar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const SITUACOES = ['Trabalho Registrado', 'Trabalho Informal', 'Nao Trabalha']

const INITIAL_FORM = {
  nome: '',
  cpf: '',
  dataNascimento: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
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

function parsearEndereco(endereco) {
  if (!endereco) return {}
  const partes = endereco.split(/[,\-–]/).map((p) => p.trim())
  if (partes.length >= 4) {
    const logradouro = partes[0] || ''
    const numero = partes[1] || ''
    const bairro = partes[2] || ''
    const cidadeUf = partes[3] || ''
    const ufMatch = cidadeUf.match(/\b([A-Z]{2})$/)
    const uf = ufMatch ? ufMatch[1] : ''
    const cidade = uf ? cidadeUf.replace(uf, '').trim().replace(/\s*$/, '') : cidadeUf
    return { logradouro, numero, bairro, cidade, uf }
  }
  return { logradouro: endereco }
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

function ModalCadastro({ apenado, onSalvar, onCancelar }) {
  const { session } = useSession()
  const comarcaId = session?.tenant?.id
  const isEditing = !!apenado

  const buildInitialForm = () => {
    if (!apenado) return INITIAL_FORM
    const parsed = parsearEndereco(apenado.endereco)
    return {
      nome: apenado.nome || '',
      cpf: apenado.cpf || '',
      dataNascimento: apenado.data_nascimento || apenado.dataNascimento || '',
      telefone: apenado.telefone || '',
      cep: apenado.cep || '',
      logradouro: apenado.logradouro || parsed.logradouro || '',
      numero: apenado.numero || parsed.numero || '',
      complemento: apenado.complemento || '',
      bairro: apenado.bairro || parsed.bairro || '',
      cidade: apenado.cidade || parsed.cidade || '',
      uf: apenado.uf || parsed.uf || '',
      instituicao: apenado.instituicao || '',
      sitTrabalhista: apenado.sit_trabalhista || '',
      observacoes: apenado.observacoes || '',
      foto: null,
    }
  }

  const [form, setForm] = useState(buildInitialForm)
  const [processos, setProcessos] = useState(() => obterProcessosIniciais(apenado))
  const [errors, setErrors] = useState({})
  const [processosErrors, setProcessosErrors] = useState(() =>
    obterProcessosIniciais(apenado).map(() => ({}))
  )
  const [preview, setPreview] = useState(apenado?.foto || apenado?.referencePhotoUrl || null)
  const [indexParaEncerrar, setIndexParaEncerrar] = useState(null)
  const [buscandoCep, setBuscandoCep] = useState(false)
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

    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, foto: 'Formato inválido. Use JPG ou PNG.' }))
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, foto: 'A foto deve ter no máximo 5 MB.' }))
      return
    }

    setForm((prev) => ({ ...prev, foto: file }))
    setErrors((prev) => ({ ...prev, foto: '' }))
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function removerFoto() {
    setForm((prev) => ({ ...prev, foto: null }))
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function buscarCep() {
    const cepLimpo = (form.cep || '').replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      setErrors((prev) => ({ ...prev, cep: 'CEP deve ter 8 dígitos.' }))
      return
    }

    setBuscandoCep(true)
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await resp.json()
      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado.' }))
      } else {
        setForm((prev) => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          uf: data.uf || prev.uf,
        }))
        setErrors((prev) => ({ ...prev, cep: '' }))
      }
    } catch {
      setErrors((prev) => ({ ...prev, cep: 'Erro ao buscar CEP. Preencha manualmente.' }))
    } finally {
      setBuscandoCep(false)
    }
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
    if (!isEditing && !form.foto && !preview) erros.foto = 'A foto é obrigatória'
    if (!form.nome.trim()) erros.nome = 'O nome é obrigatório'
    if (!form.cpf || form.cpf.replace(/\D/g, '').length < 11) erros.cpf = 'O CPF é obrigatório'
    else if (!validarCPF(form.cpf)) erros.cpf = 'CPF inválido'
    if (!form.dataNascimento) erros.dataNascimento = 'A data de nascimento é obrigatória'
    if (!form.telefone || form.telefone.replace(/\D/g, '').length < 10)
      erros.telefone = 'O telefone é obrigatório'
    if (!form.logradouro.trim()) erros.logradouro = 'O logradouro é obrigatório'
    if (!form.numero.trim()) erros.numero = 'O número é obrigatório'
    if (!form.bairro.trim()) erros.bairro = 'O bairro é obrigatório'
    if (!form.cidade.trim()) erros.cidade = 'A cidade é obrigatória'
    if (!form.uf.trim()) erros.uf = 'A UF é obrigatória'
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

  function montarEndereco() {
    const parts = [form.logradouro, form.numero].filter(Boolean).join(', ')
    const rest = [form.bairro, form.cidade].filter(Boolean).join(', ')
    const full = [parts, rest].filter(Boolean).join(' - ')
    return form.uf ? `${full} - ${form.uf}` : full
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

    const resultado = {
      id: isEditing ? apenado.id : generateUUID(),
      tenant_id: isEditing ? apenado.tenant_id : comarcaId,
      nome: form.nome,
      cpf: form.cpf,
      data_nascimento: form.dataNascimento,
      telefone: form.telefone,
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      endereco: montarEndereco(),
      instituicao: form.instituicao,
      sit_trabalhista: form.sitTrabalhista,
      status: statusApenado,
      observacoes: form.observacoes,
      foto: preview,
      processos: processos,
    }
    onSalvar(resultado)
  }

  const inputClass = (field) =>
    `w-full rounded-md border px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 ${
      errors[field]
        ? 'border-destructive ring-destructive/20 ring-3'
        : 'border-input dark:bg-input/30'
    }`

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancelar()
      }}
    >
      <ModalAvisoEncerrar
        aberto={indexParaEncerrar !== null}
        onConfirmar={handleConfirmarEncerramento}
        onCancelar={() => setIndexParaEncerrar(null)}
      />

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl"
      >
        <DialogHeader className="flex-row items-start justify-between gap-4 px-6 py-4 text-left">
          <div>
            <DialogTitle className="text-lg font-bold">
              {isEditing ? 'Editar Apenado' : 'Cadastrar Novo Apenado'}
            </DialogTitle>
            <DialogDescription className="mt-1">
              Preencha os dados do apenado no formulário abaixo
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button type="button" variant="ghost" size="icon-sm" className="shrink-0">
              <X />
              <span className="sr-only">Fechar modal</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-left">
          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
            Foto de Reconhecimento <span className="text-destructive">*</span>
          </p>

          <div className="mb-5">
            <div className="mb-4 flex items-start gap-4">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className={`hover:bg-muted flex h-20 w-20 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                    errors.foto ? 'border-destructive' : 'border-border'
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <>
                      <Upload className="text-muted-foreground h-5 w-5" />
                      <span className="text-muted-foreground mt-1 px-1 text-center text-[10px] leading-tight">
                        Adicionar
                      </span>
                    </>
                  )}
                </button>
                {preview && (
                  <button
                    type="button"
                    onClick={removerFoto}
                    className="bg-destructive absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-start gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current.click()}
                  className="gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {preview ? 'Trocar foto' : 'Enviar foto'}
                </Button>
                <span className="text-muted-foreground text-xs">
                  JPG ou PNG, até 5MB. Envio obrigatório.
                </span>
                {errors.foto && (
                  <span className="text-destructive text-xs font-medium">{errors.foto}</span>
                )}
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleFoto}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label
                  htmlFor="modal-nome"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-nome"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  placeholder="Nome e sobrenome"
                  aria-invalid={errors.nome ? true : undefined}
                  className={inputClass('nome')}
                />
                {errors.nome && <p className="text-destructive mt-0.5 text-xs">{errors.nome}</p>}
              </div>
              <div>
                <Label
                  htmlFor="modal-cpf"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  CPF <span className="text-destructive">*</span>
                </Label>
                <IMaskInput
                  id="modal-cpf"
                  mask="000.000.000-00"
                  value={form.cpf}
                  onAccept={(val) => handleMask('cpf', val)}
                  placeholder="000.000.000-00"
                  className={inputClass('cpf')}
                />
                {errors.cpf && <p className="text-destructive mt-0.5 text-xs">{errors.cpf}</p>}
              </div>
              <div>
                <Label
                  htmlFor="modal-nascimento"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Data de Nascimento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-nascimento"
                  type="date"
                  name="dataNascimento"
                  value={form.dataNascimento}
                  onChange={handleChange}
                  aria-invalid={errors.dataNascimento ? true : undefined}
                  className={inputClass('dataNascimento')}
                />
                {errors.dataNascimento && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.dataNascimento}</p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="modal-telefone"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <IMaskInput
                  id="modal-telefone"
                  mask="(00) 00000-0000"
                  value={form.telefone}
                  onAccept={(val) => handleMask('telefone', val)}
                  placeholder="(00) 00000-0000"
                  className={inputClass('telefone')}
                />
                {errors.telefone && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.telefone}</p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="border-border mb-5 rounded-lg border p-4">
            <p className="text-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
              Endereço
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label
                  htmlFor="modal-cep"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  CEP <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <IMaskInput
                    id="modal-cep"
                    mask="00000-000"
                    value={form.cep}
                    onAccept={(val) => handleMask('cep', val)}
                    placeholder="00000-000"
                    className={`flex-1 ${inputClass('cep')}`}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={buscarCep}
                    disabled={buscandoCep}
                    className="shrink-0 px-3"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                {errors.cep && <p className="text-destructive mt-0.5 text-xs">{errors.cep}</p>}
              </div>

              <div className="sm:col-span-4">
                <Label
                  htmlFor="modal-logradouro"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Logradouro <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-logradouro"
                  name="logradouro"
                  value={form.logradouro}
                  onChange={handleChange}
                  placeholder="Rua, Avenida..."
                  className={inputClass('logradouro')}
                />
                {errors.logradouro && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.logradouro}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label
                  htmlFor="modal-numero"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Número <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-numero"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  placeholder="123"
                  className={inputClass('numero')}
                />
                {errors.numero && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.numero}</p>
                )}
              </div>

              <div className="sm:col-span-3">
                <Label
                  htmlFor="modal-complemento"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Complemento
                </Label>
                <Input
                  id="modal-complemento"
                  name="complemento"
                  value={form.complemento}
                  onChange={handleChange}
                  placeholder="Apto, bloco..."
                  className={inputClass('complemento')}
                />
              </div>

              <div className="sm:col-span-3">
                <Label
                  htmlFor="modal-bairro"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Bairro <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-bairro"
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  className={inputClass('bairro')}
                />
                {errors.bairro && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.bairro}</p>
                )}
              </div>

              <div className="sm:col-span-4">
                <Label
                  htmlFor="modal-cidade"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  Cidade <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-cidade"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                  className={inputClass('cidade')}
                />
                {errors.cidade && (
                  <p className="text-destructive mt-0.5 text-xs">{errors.cidade}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label
                  htmlFor="modal-uf"
                  className="text-muted-foreground mb-1 text-xs font-semibold"
                >
                  UF <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="modal-uf"
                  name="uf"
                  value={form.uf}
                  onChange={handleChange}
                  placeholder="UF"
                  maxLength={2}
                  className={inputClass('uf')}
                />
                {errors.uf && <p className="text-destructive mt-0.5 text-xs">{errors.uf}</p>}
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="border-border mb-5 rounded-lg border p-4">
            <p className="text-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
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
              <Button
                type="button"
                variant="outline"
                onClick={handleAdicionarProcesso}
                className="w-full border-dashed"
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
              </Button>
            </div>
          </div>

          <Separator className="my-5" />

          <p className="text-muted-foreground mb-4 text-xs font-semibold tracking-widest uppercase">
            Situação Laboral
          </p>
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="modal-instituicao"
                className="text-muted-foreground mb-1 text-xs font-semibold"
              >
                Instituição / Unidade
              </Label>
              <Input
                id="modal-instituicao"
                name="instituicao"
                value={form.instituicao}
                onChange={handleChange}
                placeholder="Nome da instituição"
                className={inputClass('instituicao')}
              />
            </div>
            <div>
              <Label
                htmlFor="modal-sit"
                className="text-muted-foreground mb-1 text-xs font-semibold"
              >
                Situação Trabalhista <span className="text-destructive">*</span>
              </Label>
              <select
                id="modal-sit"
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
                <p className="text-destructive mt-0.5 text-xs">{errors.sitTrabalhista}</p>
              )}
            </div>
          </div>

          <Separator className="my-5" />

          <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
            Observações
          </p>
          <div className="mb-2">
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              placeholder="Adicione observações relevantes sobre o apenado..."
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex w-full rounded-md border bg-transparent px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3"
            />
          </div>
        </div>

        <div className="border-border mt-auto flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground text-xs">* campos obrigatórios</p>
          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelar}
              className="rounded-lg px-5"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSalvar}
              disabled={!isEditing && !form.foto && !preview}
              className="rounded-lg px-5"
            >
              {isEditing ? 'Salvar' : 'Salvar cadastro'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalCadastro
