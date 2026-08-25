import { InputField } from '@/shared/components/form-fields/InputField'
import { cn } from '@/shared/lib/utils'
import { formatCpf } from '@/shared/lib/cpf'

const authInputStyles = 'h-13 rounded-[8px] border-2 px-3 py-4 text-sm'

export function CpfField({
  id = 'cpf',
  label = 'CPF',
  variant = 'default',
  error,
  disabled,
  registration,
  className,
  errorClassName,
  fieldClassName,
  inputWrapperClassName,
  labelClassName,
}) {
  const { onChange, ...restRegistration } = registration || {}
  const shouldUseAuthStyles = variant === 'auth'

  return (
    <InputField
      id={id}
      label={label}
      type="text"
      inputMode="numeric"
      placeholder="000.000.000-00"
      disabled={disabled}
      error={error}
      className={cn(shouldUseAuthStyles && authInputStyles, className)}
      errorClassName={errorClassName}
      fieldClassName={fieldClassName}
      inputWrapperClassName={inputWrapperClassName}
      labelClassName={cn(shouldUseAuthStyles && 'text-lg font-normal', labelClassName)}
      registration={{
        ...restRegistration,
        onChange: (event) => {
          event.target.value = formatCpf(event.target.value)
          onChange?.(event)
        },
      }}
    />
  )
}
