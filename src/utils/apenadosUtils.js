import { mockApenados } from '@/mocks/apenados.mock.js'

export const STORAGE_KEY = 'apenados_data_v6'

export function normalizeApenado(a) {
  return {
    id: a.id != null ? String(a.id) : crypto.randomUUID(),
    tenant_id: a.tenant_id || a.tenantId || null,
    nome: a.nome || a.fullName || '',
    cpf: a.cpf || '',
    data_nascimento: a.data_nascimento || a.dateOfBirth || '',
    telefone: a.telefone || a.phone || '',
    endereco: a.endereco || a.address || '',
    cep: a.cep || '',
    logradouro: a.logradouro || '',
    numero: a.numero || '',
    complemento: a.complemento || '',
    bairro: a.bairro || '',
    cidade: a.cidade || '',
    uf: a.uf || '',
    sit_trabalhista:
      a.sit_trabalhista ||
      (a.workingStatus === 'working_formal'
        ? 'Trabalho Registrado'
        : a.workingStatus === 'working_informal'
          ? 'Trabalho Informal'
          : a.workingStatus === 'not_working'
            ? 'Nao Trabalha'
            : '') ||
      '',
    status: a.status || 'Ativo',
    foto: a.foto || a.referencePhotoUrl || '',
    processos: a.processos || [],
    numero_processo:
      a.numero_processo ||
      a.numeroProcesso ||
      (a.processos && a.processos.length ? a.processos[0].numeroProcesso : '') ||
      '',
    vara: a.vara || '',
    observacoes: a.observacoes || a.observations || '',
    instituicao: a.instituicao || '',
  }
}

export function getStoredApenados() {
  const salvo = localStorage.getItem(STORAGE_KEY)

  const sourceFromMock =
    mockApenados && mockApenados.apenados
      ? mockApenados.apenados
      : Array.isArray(mockApenados)
        ? mockApenados
        : []

  if (!salvo) return sourceFromMock.map(normalizeApenado)

  try {
    const parsed = JSON.parse(salvo)
    const source = Array.isArray(parsed) ? parsed : parsed?.apenados || sourceFromMock
    return Array.isArray(source)
      ? source.map(normalizeApenado)
      : sourceFromMock.map(normalizeApenado)
  } catch {
    return sourceFromMock.map(normalizeApenado)
  }
}

export function parsearEndereco(endereco) {
  if (!endereco) return {}
  const partes = endereco.split(/[,\-\u2013]/).map((p) => p.trim())
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

export function obterProcessosIniciais(apenado) {
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

export function criarProcessoVazio() {
  return {
    id: crypto.randomUUID(),
    numeroProcesso: '',
    vara: '',
    tipoPena: '',
    status: 'ATIVO',
  }
}

export function validarCPF(cpf) {
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

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function montarEnderecoStr(form) {
  const parts = [form.logradouro, form.numero].filter(Boolean).join(', ')
  const rest = [form.bairro, form.cidade].filter(Boolean).join(', ')
  const full = [parts, rest].filter(Boolean).join(' - ')
  return form.uf ? `${full} - ${form.uf}` : full
}
