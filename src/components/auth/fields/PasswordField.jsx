import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { AuthInputField } from '@/components/auth/fields/AuthInputField'
import { cn } from '@/lib/utils'

export function PasswordField({
  id = 'password',
  label = 'Senha',
  error,
  disabled,
  registration,
  labelAction,
  placeholder = 'Digite sua senha',
  className,
  errorClassName,
  fieldClassName,
  inputWrapperClassName,
  labelClassName,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

  return (
    <AuthInputField
      id={id}
      label={label}
      labelAction={labelAction}
      type={showPassword ? 'text' : 'password'}
      inputMode="text"
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      registration={registration}
      className={cn('pr-12', className)}
      errorClassName={errorClassName}
      fieldClassName={fieldClassName}
      inputWrapperClassName={inputWrapperClassName}
      labelClassName={labelClassName}
      rightElement={
        <button
          type="button"
          disabled={disabled}
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 focus-visible:outline-none"
        >
          {showPassword ? (
            <EyeOff size={24} strokeWidth={1.5} />
          ) : (
            <Eye size={24} strokeWidth={1.5} />
          )}
        </button>
      }
    />
  )
}
