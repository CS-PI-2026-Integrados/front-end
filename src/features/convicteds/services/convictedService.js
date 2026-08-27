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
    const num = p.processNumber || p.numeroProcesso || p.numero_processo || ''
    const v = p.court || p.vara || ''
    const inst = p.institution || p.instituicao || ''
    const tipo = p.penaltyType || p.tipoPena || p.judicialStatus || ''
    return {
      id: String(p.id || crypto.randomUUID()),
      processNumber: num,
      court: v,
      penaltyType: tipo,
      institution: inst,
      status: p.status || p.situacao || 'regular',
      tenantId: String(p.tenantId || p.tenant_id || a.tenantId || a.tenant_id || '1'),
      apenadoId: String(p.apenadoId || a.id),
      apenadoIds: p.apenadoIds ? p.apenadoIds.map(String) : [String(a.id)],
    }
  })

  const primeiroProcesso = procs.length > 0 ? procs[0] : null

  const numProcesso =
    primeiroProcesso?.processNumber ||
    a.processNumber ||
    a.numeroProcesso ||
    a.numero_processo ||
    ''

  const vara = primeiroProcesso?.court || a.court || a.vara || ''

  const instituicao = primeiroProcesso?.institution || a.institution || a.instituicao || ''

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
    !logradouro && (a.address || a.endereco) ? parsearEndereco(a.address || a.endereco) : {}

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

  const enderecoFormatado = a.address || a.endereco || montarEnderecoStr(formEndereco)

  const sitTrab =
    a.workingStatus ||
    (a.situacaoTrabalhista === 'registrado' || a.sit_trabalhista === 'Trabalho Registrado'
      ? 'working_formal'
      : a.situacaoTrabalhista === 'informal' || a.sit_trabalhista === 'Trabalho Informal'
        ? 'working_informal'
        : 'not_working')

  const workingStatus =
    sitTrab === 'working_formal' || sitTrab === 'registrado'
      ? 'working_formal'
      : sitTrab === 'working_informal' || sitTrab === 'informal'
        ? 'working_informal'
        : 'not_working'

  const nome = a.fullName || a.nomeCompleto || a.nome || ''
  const foto = a.referencePhotoUrl || a.fotoUrl || a.foto || ''

  return {
    id: a.id != null ? String(a.id) : crypto.randomUUID(),
    tenantId: String(a.tenantId || a.tenant_id || '1'),
    fullName: nome,
    cpf: a.cpf || '',
    dateOfBirth: a.dateOfBirth || a.dataNascimento || a.data_nascimento || '',
    phone: a.phone || a.telefone || '',
    cep,
    logradouro: finalLogradouro,
    numero: finalNumero,
    complemento: finalComplemento,
    bairro: finalBairro,
    cidade: finalCidade,
    uf: finalUf,
    address: enderecoFormatado,
    institution: instituicao,
    workingStatus,
    status: a.status === 'Inativo' || a.situacao === 'inativo' ? 'Inativo' : 'Ativo',
    observations: a.observations || a.observacoes || '',
    referencePhotoUrl: foto,
    processoId: a.processoId ? String(a.processoId) : primeiroProcesso?.id || '',
    processNumber: numProcesso,
    court: vara,
    penaltyType: primeiroProcesso?.penaltyType || a.penaltyType || a.tipoPena || '',
    processos: procs,
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
