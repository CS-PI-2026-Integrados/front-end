import { obterForcaSenha } from './passwordStrength'

export function PasswordStrengthMeter({ password = '' }) {
  const strength = obterForcaSenha(password)
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full ${index < strength.score ? strength.color : 'bg-secondary'}`}
          />
        ))}
      </div>
      <p className={`min-h-4 text-right text-xs font-medium ${strength.textColor}`}>
        {password ? strength.label : ''}
      </p>
    </div>
  )
}
