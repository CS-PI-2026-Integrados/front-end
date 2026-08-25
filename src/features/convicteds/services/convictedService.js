import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { APENADOS_STORAGE_KEY, apenadosIniciais } from '@/features/convicteds/mock/convictedsMock'
import { mockProcessos } from '@/features/convicteds/mock/processosMock'
import { mockEnderecos, getEnderecoByCep } from '@/features/convicteds/mock/enderecosMock'
import { parsearEndereco, montarEnderecoStr } from '@/features/convicteds/utils/convictedUtils'

function getProcessosPorApenadoMap() {
  const processosList = mockProcessos?.processos || []
  return processosList.reduce((acc, processo) => {
    const ids = Array.isArray(processo.apenadoIds)
      ? processo.apenadoIds
      : processo.apenadoId
        ? [processo.apenadoId]
        : []

    ids.forEach((id) => {
      if (!acc[id]) {
        acc[id] = []
      }
      acc[id].push(processo)
    })
    return acc
  }, {})
}

function getEnderecosPorApenadoMap() {
  const lista = mockEnderecos?.enderecos || []
  return lista.reduce((acc, end) => {
    if (end.apenadoId) {
      acc[String(end.apenadoId)] = end
    }
    return acc
  }, {})
}

export function toConvicted(a) {
  if (!a) return null

  const processosPorApenado = getProcessosPorApenadoMap()
  const procsFromMock = processosPorApenado[String(a.id)]
  const procsRaw = procsFromMock !== undefined ? procsFromMock : a.processos || []

  const procs = procsRaw.map((p) => {
    const num = p.processNumber || p.numeroProcesso || ''
    const v = p.court || p.vara || ''
    const inst = p.institution || p.instituicao || ''
    const tipo = p.penaltyType || p.tipoPena || p.judicialStatus || ''
    return {
      id: String(p.id || crypto.randomUUID()),
      processNumber: num,
      numeroProcesso: num,
      court: v,
      vara: v,
      penaltyType: tipo,
      tipoPena: tipo,
      judicialStatus: p.judicialStatus || tipo,
      institution: inst,
      instituicao: inst,
      status: p.status || p.situacao || 'ativo',
      situacao: p.situacao || p.status || 'ativo',
      tenantId: String(p.tenantId || p.tenant_id || a.tenantId || a.tenant_id || '1'),
      apenadoId: String(p.apenadoId || a.id),
      apenadoIds: p.apenadoIds ? p.apenadoIds.map(String) : [String(a.id)],
    }
  })

  const primeiroProcesso = procs.length > 0 ? procs[0] : null

  const numProcesso = primeiroProcesso
    ? primeiroProcesso.numeroProcesso
    : a.numeroProcesso || a.processNumber || a.numero_processo || ''

  const vara = primeiroProcesso ? primeiroProcesso.vara : a.vara || a.court || ''

  const instituicao = primeiroProcesso
    ? primeiroProcesso.instituicao
    : a.instituicao || a.institution || ''

  const enderecosPorApenado = getEnderecosPorApenadoMap()
  const endFromMock = enderecosPorApenado[String(a.id)]

  const cep = a.cep || endFromMock?.cep || ''
  const logradouro = a.logradouro || endFromMock?.logradouro || ''
  const numero = a.numero || endFromMock?.numero || ''
  const complemento = a.complemento || endFromMock?.complemento || ''
  const bairro = a.bairro || endFromMock?.bairro || ''
  const cidade = a.cidade || endFromMock?.cidade || ''
  const uf = a.uf || endFromMock?.uf || ''

  const parsed =
    !logradouro && (a.endereco || a.address) ? parsearEndereco(a.endereco || a.address) : {}

  const finalLogradouro = logradouro || parsed.logradouro || ''
  const finalNumero = numero || parsed.numero || ''
  const finalComplemento = complemento || parsed.complemento || ''
  const finalBairro = bairro || parsed.bairro || ''
  const finalCidade = cidade || parsed.cidade || ''
  const finalUf = uf || parsed.uf || ''

  const formEndereco = {
    logradouro: finalLogradouro,
    numero: finalNumero,
    complemento: finalComplemento,
    bairro: finalBairro,
    cidade: finalCidade,
    uf: finalUf,
  }

  const enderecoFormatado = a.endereco || a.address || montarEnderecoStr(formEndereco)

  const sitTrab =
    a.situacaoTrabalhista ||
    (a.workingStatus === 'working_formal' || a.sit_trabalhista === 'Trabalho Registrado'
      ? 'registrado'
      : a.workingStatus === 'working_informal' || a.sit_trabalhista === 'Trabalho Informal'
        ? 'informal'
        : 'naoTrabalha')

  const workingStatus =
    sitTrab === 'registrado'
      ? 'working_formal'
      : sitTrab === 'informal'
        ? 'working_informal'
        : 'not_working'

  const sitTrabalhistaLabel =
    sitTrab === 'registrado'
      ? 'Trabalho Registrado'
      : sitTrab === 'informal'
        ? 'Trabalho Informal'
        : 'Nao Trabalha'

  const nome = a.nomeCompleto || a.nome || a.fullName || ''
  const foto = a.fotoUrl || a.foto || a.referencePhotoUrl || ''

  return {
    id: a.id != null ? String(a.id) : crypto.randomUUID(),
    tenantId: String(a.tenantId || a.tenant_id || '1'),
    tenant_id: String(a.tenantId || a.tenant_id || '1'),
    nomeCompleto: nome,
    nome,
    fullName: nome,
    cpf: a.cpf || '',
    dataNascimento: a.dataNascimento || a.data_nascimento || a.dateOfBirth || '',
    data_nascimento: a.dataNascimento || a.data_nascimento || a.dateOfBirth || '',
    dateOfBirth: a.dataNascimento || a.data_nascimento || a.dateOfBirth || '',
    telefone: a.telefone || a.phone || '',
    phone: a.telefone || a.phone || '',
    endereco: enderecoFormatado,
    address: enderecoFormatado,
    cep,
    logradouro: finalLogradouro,
    numero: finalNumero,
    complemento: finalComplemento,
    bairro: finalBairro,
    cidade: finalCidade,
    uf: finalUf,
    situacaoTrabalhista: sitTrab,
    workingStatus,
    sit_trabalhista: sitTrabalhistaLabel,
    situacao: a.situacao || (a.status === 'Inativo' ? 'inativo' : 'ativo'),
    status: a.status || (a.situacao === 'inativo' ? 'Inativo' : 'Ativo'),
    fotoUrl: foto,
    foto,
    referencePhotoUrl: foto,
    observacoes: a.observacoes || a.observations || '',
    observations: a.observacoes || a.observations || '',
    processos: procs,
    numeroProcesso: numProcesso,
    processNumber: numProcesso,
    numero_processo: numProcesso,
    vara,
    court: vara,
    instituicao,
    institution: instituicao,
    createdAt: a.createdAt || '2024-01-15',
    lastProof: a.lastProof || null,
  }
}

export function listarApenados() {
  let raw = readJson(APENADOS_STORAGE_KEY, null)
  if (!raw) {
    raw = readJson('apenados_data_v6', null)
  }

  if (!raw) return apenadosIniciais.map(toConvicted)

  const source = Array.isArray(raw) ? raw : raw?.apenados || apenadosIniciais
  return Array.isArray(source) && source.length > 0
    ? source.map(toConvicted)
    : apenadosIniciais.map(toConvicted)
}

export function salvarApenados(apenados) {
  writeJson(APENADOS_STORAGE_KEY, apenados)
  writeJson('apenados_data_v6', apenados)
  return apenados
}

export async function buscarEnderecoPorCep(cep, { signal } = {}) {
  const cepLimpo = (cep || '').replace(/\D/g, '')
  if (cepLimpo.length !== 8) return null

  try {
    const resp = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`, { signal })
    const data = await resp.json()

    if (data.erro) {
      return getEnderecoByCep(cepLimpo)
    }

    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      uf: data.uf || '',
    }
  } catch {
    return getEnderecoByCep(cepLimpo)
  }
}
