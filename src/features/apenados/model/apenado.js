/**
 * Modelo canônico de um apenado consumido pela interface.
 *
 * @typedef {Object} Apenado
 * @property {string} id
 * @property {string} tenantId
 * @property {string} nomeCompleto
 * @property {string} cpf
 * @property {string} telefone
 * @property {string} endereco
 * @property {'registrado'|'informal'|'naoTrabalha'} situacaoTrabalhista
 * @property {'ativo'|'inativo'} situacao
 * @property {string|null} fotoUrl
 * @property {string} observacoes
 * @property {Processo[]} processos
 */

/** @typedef {'ativo'|'encerrado'} SituacaoProcesso */

/**
 * Processo vinculado a um apenado. A UI não usa nomes de campos de payload.
 *
 * @typedef {Object} Processo
 * @property {string} id
 * @property {string} tenantId
 * @property {string} apenadoId
 * @property {string} numeroProcesso
 * @property {string} vara
 * @property {string} tipoPena
 * @property {SituacaoProcesso} situacao
 */

const situacoesTrabalhistas = {
  registrado: 'registrado',
  informal: 'informal',
  naoTrabalha: 'naoTrabalha',
}

function normalizarSituacaoTrabalhista(valor) {
  const normalizado = String(valor || '').toLowerCase()
  if (normalizado.includes('informal')) return situacoesTrabalhistas.informal
  if (normalizado.includes('nao') || normalizado.includes('not_working')) {
    return situacoesTrabalhistas.naoTrabalha
  }
  return situacoesTrabalhistas.registrado
}

function normalizarSituacao(valor) {
  return String(valor || '')
    .toLowerCase()
    .includes('inativ')
    ? 'inativo'
    : 'ativo'
}

/** Converts legacy mock and storage shapes to the canonical process model. */
export function normalizarProcesso(valor, apenadoId = '', tenantId = '') {
  return {
    id: String(valor?.id ?? ''),
    tenantId: String(valor?.tenantId ?? valor?.tenant_id ?? tenantId ?? ''),
    apenadoId: String(valor?.apenadoId ?? valor?.apenado_id ?? apenadoId ?? ''),
    numeroProcesso: valor?.numeroProcesso ?? valor?.numero_processo ?? valor?.processNumber ?? '',
    vara: valor?.vara ?? '',
    tipoPena: valor?.tipoPena ?? valor?.judicialStatus ?? '',
    situacao: String(valor?.situacao ?? valor?.status ?? '')
      .toLowerCase()
      .includes('encerr')
      ? 'encerrado'
      : 'ativo',
  }
}

/**
 * Converts legacy mock and local-storage records to the canonical UI model.
 * @returns {Apenado}
 */
export function normalizarApenado(valor) {
  const id = String(valor?.id ?? '')
  const tenantId = String(valor?.tenantId ?? valor?.tenant_id ?? '')

  return {
    id,
    tenantId,
    nomeCompleto: valor?.nomeCompleto ?? valor?.nome ?? valor?.fullName ?? '',
    cpf: valor?.cpf ?? '',
    telefone: valor?.telefone ?? valor?.phone ?? '',
    endereco: valor?.endereco ?? valor?.address ?? '',
    situacaoTrabalhista: normalizarSituacaoTrabalhista(
      valor?.situacaoTrabalhista ??
        valor?.sit_trabalhista ??
        valor?.sitTrabalhista ??
        valor?.workingStatus
    ),
    situacao: normalizarSituacao(valor?.situacao ?? valor?.status),
    fotoUrl: valor?.fotoUrl ?? valor?.foto ?? valor?.referencePhotoUrl ?? null,
    observacoes: valor?.observacoes ?? valor?.observations ?? '',
    processos: (valor?.processos ?? []).map((processo) =>
      normalizarProcesso(processo, id, tenantId)
    ),
  }
}

export function rotuloSituacaoApenado(situacao) {
  return situacao === 'inativo' ? 'Inativo' : 'Ativo'
}

export function rotuloSituacaoTrabalhista(situacao) {
  return (
    {
      registrado: 'Trabalho Registrado',
      informal: 'Trabalho Informal',
      naoTrabalha: 'Não Trabalha',
    }[situacao] ?? 'Não Trabalha'
  )
}
