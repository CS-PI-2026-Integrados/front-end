import { Eye, EyeOff } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const inputBaseStyles =
  'h-13 w-full rounded-[8px] border-2 px-3 py-4 text-sm text-black transition-colors outline-none placeholder:text-gray-300 disabled:bg-gray-100 disabled:opacity-70'
const inputDefaultStyles =
  'border-gray-400 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500'
const inputErrorStyles =
  'border-red-500 focus-visible:ring-red-500 focus-visible:ring-2 focus-visible:border-red-500'

export function PasswordField({
  id = 'password',
  label = 'Senha',
  error,
  disabled,
  registration,
  showPassword,
  onToggleVisibility,
  labelAction,
  className,
}) {
  return (
    <Field className="gap-1">
      <div className="flex justify-between">
        <FieldLabel htmlFor={id} className="text-lg font-normal text-gray-600">
          {label}
        </FieldLabel>
        {labelAction}
      </div>
      <div className="relative mt-1">
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          inputMode="text"
          placeholder="Digite sua senha"
          disabled={disabled}
          {...registration}
          className={`${inputBaseStyles} ${error ? inputErrorStyles : inputDefaultStyles} ${className || ''}`}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={onToggleVisibility}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none"
        >
          {showPassword ? (
            <EyeOff size={24} strokeWidth={1.5} />
          ) : (
            <Eye size={24} strokeWidth={1.5} />
          )}
        </button>
      </div>
      <span className="mt-1 block h-3 min-h-4 text-sm text-red-500">{error || ''}</span>
    </Field>
  )
}
