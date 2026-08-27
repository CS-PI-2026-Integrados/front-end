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

export function montarEnderecoStr(form) {
  const parts = [form.logradouro, form.numero].filter(Boolean).join(', ')
  const rest = [form.bairro, form.cidade].filter(Boolean).join(', ')
  const full = [parts, rest].filter(Boolean).join(' - ')
  return form.uf ? `${full} - ${form.uf}` : full
}

export { compressImage } from '@/shared/lib/image'
