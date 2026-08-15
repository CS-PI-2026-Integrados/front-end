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
