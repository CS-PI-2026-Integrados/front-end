import { useState, useRef } from 'react'
import {
  parsearEndereco,
  obterProcessosIniciais,
  criarProcessoVazio,
  validarCPF,
  generateUUID,
  montarEnderecoStr,
} from '@/utils/apenadosUtils'

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

export function useApenadoForm(apenado, comarcaId) {
  const isEditing = !!apenado
  const fileRef = useRef(null)

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

  function encerrarProcesso(index) {
    setProcessos((prev) => prev.map((p, i) => (i === index ? { ...p, status: 'ENCERRADO' } : p)))
  }

  function handlePedirEncerramento(index) {
    const ativos = contarProcessosAtivos()
    if (ativos === 1) {
      setIndexParaEncerrar(index)
    } else {
      encerrarProcesso(index)
    }
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

  function tentarSalvar(onSalvarCallback) {
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
      endereco: montarEnderecoStr(form),
      instituicao: form.instituicao,
      sit_trabalhista: form.sitTrabalhista,
      status: statusApenado,
      observacoes: form.observacoes,
      foto: preview,
      processos: processos,
    }

    onSalvarCallback(resultado)
  }

  return {
    isEditing,
    fileRef,
    form,
    processos,
    errors,
    processosErrors,
    preview,
    indexParaEncerrar,
    buscandoCep,
    actions: {
      handleChange,
      handleMask,
      handleFoto,
      removerFoto,
      buscarCep,
      handleProcessoChange,
      handleAdicionarProcesso,
      handlePedirEncerramento,
      handleConfirmarEncerramento,
      setIndexParaEncerrar,
      tentarSalvar,
    },
  }
}
