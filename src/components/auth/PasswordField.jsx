import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { InputField } from '@/components/form-fields/InputField'
import { cn } from '@/lib/utils'

const authInputStyles = 'h-13 rounded-[8px] border-2 px-3 py-4 text-sm'

export function PasswordField({
  id = 'password',
  label = 'Senha',
  variant = 'default',
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
  const shouldUseAuthStyles = variant === 'auth'

  return (
    <InputField
      id={id}
      label={label}
      labelAction={labelAction}
      type={showPassword ? 'text' : 'password'}
      inputMode="text"
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      registration={registration}
      className={cn(shouldUseAuthStyles && authInputStyles, 'pr-12', className)}
      errorClassName={errorClassName}
      fieldClassName={fieldClassName}
      inputWrapperClassName={inputWrapperClassName}
      labelClassName={cn(shouldUseAuthStyles && 'text-lg font-normal', labelClassName)}
      rightElement={
        <button
          type="button"
          disabled={disabled}
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 focus-visible:outline-none"
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
