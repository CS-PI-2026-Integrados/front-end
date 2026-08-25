const regrasDeForca = [
  (senha) => senha.length >= 8,
  (senha) => /[A-Z]/.test(senha) && /[a-z]/.test(senha),
  (senha) => /\d/.test(senha),
  (senha) => /[^A-Za-z0-9]/.test(senha),
]

export function obterForcaSenha(senha) {
  const score = regrasDeForca.filter((regra) => regra(senha)).length
  if (score <= 1) return { score, label: 'Fraca', color: 'bg-red-500', textColor: 'text-red-600' }
  if (score <= 3)
    return { score, label: 'Média', color: 'bg-amber-500', textColor: 'text-amber-600' }
  return { score, label: 'Forte', color: 'bg-emerald-600', textColor: 'text-emerald-700' }
}
