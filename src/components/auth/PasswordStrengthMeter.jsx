const strengthRules = [
  (password) => password.length >= 8,
  (password) => /[A-Z]/.test(password) && /[a-z]/.test(password),
  (password) => /\d/.test(password),
  (password) => /[^A-Za-z0-9]/.test(password),
]

const getStrength = (password) => {
  const score = strengthRules.filter((rule) => rule(password)).length

  if (score <= 1) return { score, label: 'Fraca', color: 'bg-red-500', textColor: 'text-red-600' }
  if (score <= 3) {
    return { score, label: 'Média', color: 'bg-amber-500', textColor: 'text-amber-600' }
  }

  return { score, label: 'Forte', color: 'bg-emerald-600', textColor: 'text-emerald-700' }
}

export function PasswordStrengthMeter({ password = '' }) {
  const strength = getStrength(password)

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full ${index < strength.score ? strength.color : 'bg-gray-200'}`}
          />
        ))}
      </div>
      <p className={`min-h-4 text-right text-xs font-medium ${strength.textColor}`}>
        {password ? strength.label : ''}
      </p>
    </div>
  )
}
