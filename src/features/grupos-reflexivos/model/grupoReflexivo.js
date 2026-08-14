/**
 * Grupo reflexivo e seus encontros no formato canônico da interface.
 * @typedef {Object} GrupoReflexivo
 * @property {string} id
 * @property {string} tenantId
 * @property {string} nome
 * @property {string} descricao
 * @property {string} dataInicio Data ISO-8601.
 * @property {string|null} dataFim Data ISO-8601 quando definido.
 * @property {number} totalEncontros
 * @property {number} minimoEncontros
 * @property {'planejamento'|'andamento'|'concluido'|'cancelado'} situacao
 * @property {Encontro[]} encontros
 */

/** @typedef {Object} Encontro
 * @property {string} id
 * @property {string} dataHorario Data ISO-8601.
 * @property {string} tema
 * @property {string[]} participantesPresentes
 * @property {'pendente'|'realizado'|'cancelado'} situacao
 */

export {}
