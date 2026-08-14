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

export const situacoesTrabalhistas = {
  registrado: 'registrado',
  informal: 'informal',
  naoTrabalha: 'naoTrabalha',
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
