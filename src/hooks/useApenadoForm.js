import { useState, useRef, useMemo } from 'react'
import {
  parsearEndereco,
  validarCPF,
  generateUUID,
  montarEnderecoStr,
  getStoredApenados,
  compressImage,
} from '@/utils/apenadosUtils'
import { mockProcessos } from '@/mocks/processos.mock'
import { getEnderecoByCep } from '@/mocks/enderecos.mock'

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
  processoId: '',
  instituicao: '',
  sitTrabalhista: '',
  observacoes: '',
  foto: null,
}

export function useApenadoForm(apenado, comarcaId) {
  const isEditing = !!apenado
  const fileRef = useRef(null)

  const processosDisponiveis = useMemo(() => {
    const lista = mockProcessos.processos || []
    if (!comarcaId) return lista
    return lista.filter((p) => !p.tenantId || String(p.tenantId) === String(comarcaId))
  }, [comarcaId])

  const buildInitialForm = () => {
    if (!apenado) return INITIAL_FORM
    const parsed = parsearEndereco(apenado.endereco)

    let initialProcessoId = ''
    if (apenado.processoId) {
      initialProcessoId = String(apenado.processoId)
    } else if (apenado.processos && apenado.processos.length > 0) {
      initialProcessoId = String(apenado.processos[0].id)
    } else if (apenado.numero_processo) {
      const proc = (mockProcessos.processos || []).find(
        (p) => p.processNumber === apenado.numero_processo
      )
      if (proc) initialProcessoId = String(proc.id)
    }

    const initialProc = (mockProcessos.processos || []).find(
      (p) => String(p.id) === String(initialProcessoId)
    )

    return {
      nome: apenado.nome || apenado.fullName || '',
      cpf: apenado.cpf || '',
      dataNascimento:
        apenado.data_nascimento || apenado.dataNascimento || apenado.dateOfBirth || '',
      telefone: apenado.telefone || apenado.phone || '',
      cep: apenado.cep || '',
      logradouro: apenado.logradouro || parsed.logradouro || '',
      numero: apenado.numero || parsed.numero || '',
      complemento: apenado.complemento || '',
      bairro: apenado.bairro || parsed.bairro || '',
      cidade: apenado.cidade || parsed.cidade || '',
      uf: apenado.uf || parsed.uf || '',
      processoId: initialProcessoId,
      instituicao:
        initialProc?.institution ||
        apenado.instituicao ||
        apenado.processos?.[0]?.institution ||
        '',
      sitTrabalhista:
        apenado.sit_trabalhista ||
        (apenado.workingStatus === 'working_formal'
          ? 'Trabalho Registrado'
          : apenado.workingStatus === 'working_informal'
            ? 'Trabalho Informal'
            : apenado.workingStatus === 'not_working'
              ? 'Nao Trabalha'
              : '') ||
        '',
      observacoes: apenado.observacoes || apenado.observations || '',
      foto: null,
    }
  }

  const [form, setForm] = useState(buildInitialForm)
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(apenado?.foto || apenado?.referencePhotoUrl || null)
  const [buscandoCep, setBuscandoCep] = useState(false)

  const procSelecionado = useMemo(() => {
    if (!form.processoId) return null
    return processosDisponiveis.find((p) => String(p.id) === String(form.processoId)) || null
  }, [form.processoId, processosDisponiveis])

  const outrosApenadosNoProcesso = useMemo(() => {
    if (!procSelecionado) return []

    const apenadosCadastrados = getStoredApenados()
    const apenadoIdAtual = apenado?.id ? String(apenado.id) : null

    const outrosIds = (procSelecionado.apenadoIds || []).filter(
      (id) => String(id) !== apenadoIdAtual
    )
    return outrosIds
      .map((id) => {
        const found = apenadosCadastrados.find((a) => String(a.id) === String(id))
        return found ? found.nome || found.fullName : null
      })
      .filter(Boolean)
  }, [procSelecionado, apenado])

  function handleChange(e) {
    const { name, value } = e.target

    if (name === 'processoId') {
      const proc = processosDisponiveis.find((p) => String(p.id) === String(value))
      setForm((prev) => ({
        ...prev,
        processoId: value,
        instituicao: proc?.institution || '',
      }))
      setErrors((prev) => ({ ...prev, processoId: '' }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function handleMask(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleFoto(e) {
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

    try {
      const compressedDataUrl = await compressImage(file, 300, 300, 0.75)
      setPreview(compressedDataUrl || null)
    } catch {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target.result)
      reader.readAsDataURL(file)
    }
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
        const mockData = getEnderecoByCep(cepLimpo)
        if (mockData) {
          setForm((prev) => ({
            ...prev,
            logradouro: mockData.logradouro || prev.logradouro,
            bairro: mockData.bairro || prev.bairro,
            cidade: mockData.cidade || prev.cidade,
            uf: mockData.uf || prev.uf,
          }))
          setErrors((prev) => ({ ...prev, cep: '' }))
        } else {
          setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado.' }))
        }
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
      const mockData = getEnderecoByCep(cepLimpo)
      if (mockData) {
        setForm((prev) => ({
          ...prev,
          logradouro: mockData.logradouro || prev.logradouro,
          bairro: mockData.bairro || prev.bairro,
          cidade: mockData.cidade || prev.cidade,
          uf: mockData.uf || prev.uf,
        }))
        setErrors((prev) => ({ ...prev, cep: '' }))
      } else {
        setErrors((prev) => ({ ...prev, cep: 'Erro ao buscar CEP. Preencha manualmente.' }))
      }
    } finally {
      setBuscandoCep(false)
    }
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
    if (!form.processoId) erros.processoId = 'O número do processo é obrigatório'
    if (!form.sitTrabalhista) erros.sitTrabalhista = 'A situação trabalhista é obrigatória'

    return erros
  }

  function tentarSalvar(onSalvarCallback) {
    const erros = validar()

    if (Object.keys(erros).length > 0) {
      setErrors(erros)
      return
    }

    const apenadoId = isEditing ? apenado.id : generateUUID()

    if (procSelecionado) {
      if (!procSelecionado.apenadoIds) procSelecionado.apenadoIds = []
      if (!procSelecionado.apenadoIds.includes(String(apenadoId))) {
        procSelecionado.apenadoIds.push(String(apenadoId))
      }
    }

    const workingStatus =
      form.sitTrabalhista === 'Trabalho Registrado'
        ? 'working_formal'
        : form.sitTrabalhista === 'Trabalho Informal'
          ? 'working_informal'
          : 'not_working'

    const resultado = {
      id: apenadoId,
      tenant_id: isEditing ? apenado.tenant_id : comarcaId,
      tenantId: isEditing ? apenado.tenant_id : comarcaId,
      nome: form.nome,
      fullName: form.nome,
      cpf: form.cpf,
      data_nascimento: form.dataNascimento,
      dateOfBirth: form.dataNascimento,
      telefone: form.telefone,
      phone: form.telefone,
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      endereco: montarEnderecoStr(form),
      address: montarEnderecoStr(form),
      instituicao: procSelecionado?.institution || form.instituicao || '',
      sit_trabalhista: form.sitTrabalhista,
      workingStatus: workingStatus,
      status: 'Ativo',
      observacoes: form.observacoes,
      observations: form.observacoes,
      foto: preview,
      referencePhotoUrl: preview,
      processoId: form.processoId,
      processNumber: procSelecionado?.processNumber || '',
      court: procSelecionado?.court || '',
      numero_processo: procSelecionado?.processNumber || '',
      vara: procSelecionado?.court || procSelecionado?.vara || '',
      processos: procSelecionado ? [procSelecionado] : [],
    }

    onSalvarCallback(resultado)
  }

  return {
    isEditing,
    fileRef,
    form,
    errors,
    preview,
    buscandoCep,
    processosDisponiveis,
    procSelecionado,
    outrosApenadosNoProcesso,
    actions: {
      handleChange,
      handleMask,
      handleFoto,
      removerFoto,
      buscarCep,
      tentarSalvar,
    },
  }
}
