import { useState, useRef, useMemo } from 'react'

import {
  buscarEnderecoPorCep,
  listarApenados,
} from '@/features/convicteds/services/convictedService'
import { mockProcessos } from '@/features/convicteds/mock/processosMock'
import { validateCPF } from '@/shared/lib/cpf'
import {
  parsearEndereco,
  montarEnderecoStr,
  compressImage,
} from '@/features/convicteds/utils/convictedUtils'

const FORMULARIO_VAZIO = {
  nomeCompleto: '',
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
  situacaoTrabalhista: '',
  observacoes: '',
  foto: null,
}

export function useConvictedForm(apenado, tenantId) {
  const isEditing = !!apenado
  const fileRef = useRef(null)

  const processosDisponiveis = useMemo(() => {
    const lista = mockProcessos.processos || []
    if (!tenantId) return lista
    return lista.filter((p) => !p.tenantId || String(p.tenantId) === String(tenantId))
  }, [tenantId])

  const buildInitialForm = () => {
    if (!apenado) return FORMULARIO_VAZIO

    const parsed = parsearEndereco(apenado.address || apenado.endereco)

    let initialProcessoId = ''
    if (apenado.processoId) {
      initialProcessoId = String(apenado.processoId)
    } else if (apenado.processos?.length > 0) {
      initialProcessoId = String(apenado.processos[0].id)
    } else if (apenado.processNumber || apenado.numeroProcesso || apenado.numero_processo) {
      const num = apenado.processNumber || apenado.numeroProcesso || apenado.numero_processo
      const proc = (mockProcessos.processos || []).find(
        (p) => p.processNumber === num || p.numeroProcesso === num
      )
      if (proc) initialProcessoId = String(proc.id)
    }

    const initialProc = (mockProcessos.processos || []).find(
      (p) => String(p.id) === String(initialProcessoId)
    )

    const sitMap = {
      working_formal: 'Trabalho Registrado',
      working_informal: 'Trabalho Informal',
      not_working: 'Nao Trabalha',
      registrado: 'Trabalho Registrado',
      informal: 'Trabalho Informal',
      naoTrabalha: 'Nao Trabalha',
      'Trabalho Registrado': 'Trabalho Registrado',
      'Trabalho Informal': 'Trabalho Informal',
      'Não Trabalha': 'Nao Trabalha',
      'Nao Trabalha': 'Nao Trabalha',
    }

    return {
      nomeCompleto: apenado.fullName || apenado.nomeCompleto || apenado.nome || '',
      cpf: apenado.cpf || '',
      dataNascimento:
        apenado.dateOfBirth || apenado.dataNascimento || apenado.data_nascimento || '',
      telefone: apenado.phone || apenado.telefone || '',
      cep: apenado.cep || '',
      logradouro: apenado.logradouro || parsed.logradouro || '',
      numero: apenado.numero || parsed.numero || '',
      complemento: apenado.complemento || parsed.complemento || '',
      bairro: apenado.bairro || parsed.bairro || '',
      cidade: apenado.cidade || parsed.cidade || '',
      uf: apenado.uf || parsed.uf || '',
      processoId: initialProcessoId,
      instituicao:
        initialProc?.institution ||
        apenado.institution ||
        apenado.instituicao ||
        apenado.processos?.[0]?.institution ||
        '',
      situacaoTrabalhista:
        sitMap[apenado.workingStatus || apenado.situacaoTrabalhista || apenado.sit_trabalhista] ||
        '',
      observacoes: apenado.observations || apenado.observacoes || '',
      foto: null,
    }
  }

  const [form, setForm] = useState(buildInitialForm)
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(
    apenado?.referencePhotoUrl || apenado?.fotoUrl || apenado?.foto || null
  )
  const [buscandoCep, setBuscandoCep] = useState(false)

  const procSelecionado = useMemo(() => {
    if (!form.processoId) return null
    return processosDisponiveis.find((p) => String(p.id) === String(form.processoId)) || null
  }, [form.processoId, processosDisponiveis])

  const outrosApenadosNoProcesso = useMemo(() => {
    if (!procSelecionado) return []

    const apenadosCadastrados = listarApenados()
    const apenadoIdAtual = apenado?.id ? String(apenado.id) : null

    const outrosIds = (procSelecionado.apenadoIds || []).filter(
      (id) => String(id) !== apenadoIdAtual
    )
    return outrosIds
      .map((id) => {
        const found = apenadosCadastrados.find((a) => String(a.id) === String(id))
        return found ? found.fullName || found.nomeCompleto || found.nome : null
      })
      .filter(Boolean)
  }, [procSelecionado, apenado])

  function handleChange(event) {
    const { name, value } = event.target

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

  async function handleFoto(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        foto: 'Formato inválido. Use JPG ou PNG.',
      }))
      return
    }

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        foto: 'A foto deve ter no máximo 5 MB.',
      }))
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
      const resultado = await buscarEnderecoPorCep(cepLimpo)
      if (resultado) {
        setForm((prev) => ({
          ...prev,
          logradouro: resultado.logradouro || prev.logradouro,
          bairro: resultado.bairro || prev.bairro,
          cidade: resultado.cidade || prev.cidade,
          uf: resultado.uf || prev.uf,
        }))
        setErrors((prev) => ({ ...prev, cep: '' }))
      } else {
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado.' }))
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        cep: 'Erro ao buscar CEP. Preencha manualmente.',
      }))
    } finally {
      setBuscandoCep(false)
    }
  }

  function validar() {
    const erros = {}
    if (!isEditing && !form.foto && !preview) erros.foto = 'A foto é obrigatória.'
    if (!form.nomeCompleto.trim()) erros.nomeCompleto = 'O nome é obrigatório.'
    if (!form.cpf || form.cpf.replace(/\D/g, '').length < 11) erros.cpf = 'O CPF é obrigatório.'
    else if (!validateCPF(form.cpf)) erros.cpf = 'CPF inválido.'
    if (!form.dataNascimento) erros.dataNascimento = 'A data de nascimento é obrigatória.'
    if (!form.telefone || form.telefone.replace(/\D/g, '').length < 10)
      erros.telefone = 'O telefone é obrigatório.'
    if (!form.logradouro.trim()) erros.logradouro = 'O logradouro é obrigatório.'
    if (!form.numero.trim()) erros.numero = 'O número é obrigatório.'
    if (!form.bairro.trim()) erros.bairro = 'O bairro é obrigatório.'
    if (!form.cidade.trim()) erros.cidade = 'A cidade é obrigatória.'
    if (!form.uf.trim()) erros.uf = 'A UF é obrigatória.'
    if (!form.processoId) erros.processoId = 'O número do processo é obrigatório.'
    if (!form.situacaoTrabalhista)
      erros.situacaoTrabalhista = 'A situação trabalhista é obrigatória.'

    return erros
  }

  function tentarSalvar(onSaveCallback) {
    const erros = validar()

    if (Object.keys(erros).length > 0) {
      setErrors(erros)
      return
    }

    const apenadoId = isEditing ? apenado.id : crypto.randomUUID()

    const updatedProc = procSelecionado
      ? {
          ...procSelecionado,
          apenadoIds: procSelecionado.apenadoIds?.includes(String(apenadoId))
            ? [...procSelecionado.apenadoIds]
            : [...(procSelecionado.apenadoIds || []), String(apenadoId)],
        }
      : null

    const sitMap = {
      'Trabalho Registrado': 'registrado',
      'Trabalho Informal': 'informal',
      'Não Trabalha': 'naoTrabalha',
      'Nao Trabalha': 'naoTrabalha',
      registrado: 'registrado',
      informal: 'informal',
      naoTrabalha: 'naoTrabalha',
    }

    const sitTrab = sitMap[form.situacaoTrabalhista] || 'naoTrabalha'

    const procObj = updatedProc
      ? {
          id: String(updatedProc.id),
          processNumber: updatedProc.processNumber || '',
          court: updatedProc.court || '',
          penaltyType: updatedProc.penaltyType || '',
          institution: updatedProc.institution || form.instituicao || '',
          status: 'regular',
          tenantId: String(isEditing ? apenado.tenantId : tenantId || '1'),
          apenadoId: String(apenadoId),
          apenadoIds: updatedProc.apenadoIds,
        }
      : null

    const resultado = {
      id: String(apenadoId),
      tenantId: String(isEditing ? apenado.tenantId : tenantId || '1'),
      fullName: form.nomeCompleto,
      cpf: form.cpf,
      dateOfBirth: form.dataNascimento,
      phone: form.telefone,
      cep: form.cep,
      logradouro: form.logradouro,
      numero: form.numero,
      complemento: form.complemento,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      address: montarEnderecoStr(form),
      institution: procSelecionado?.institution || form.instituicao || '',
      workingStatus:
        sitTrab === 'registrado'
          ? 'working_formal'
          : sitTrab === 'informal'
            ? 'working_informal'
            : 'not_working',
      status: isEditing && apenado?.status ? apenado.status : 'Ativo',
      observations: form.observacoes,
      referencePhotoUrl: preview || '',
      processoId: form.processoId,
      processNumber: procSelecionado?.processNumber || '',
      court: procSelecionado?.court || '',
      penaltyType: procSelecionado?.penaltyType || '',
      processos: procObj ? [procObj] : [],
      createdAt: isEditing && apenado?.createdAt ? apenado.createdAt : '2024-01-15',
      lastProof: isEditing && apenado?.lastProof ? apenado.lastProof : null,
    }

    onSaveCallback(resultado)
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
