import { AuthInputField } from '@/components/auth/fields/AuthInputField'
import { formatCpf } from '@/lib/validadorCpf'

export function CpfField({
  id = 'cpf',
  label = 'CPF',
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

  return (
    <AuthInputField
      id={id}
      label={label}
      type="text"
      inputMode="numeric"
      placeholder="000.000.000-00"
      disabled={disabled}
      error={error}
      className={className}
      errorClassName={errorClassName}
      fieldClassName={fieldClassName}
      inputWrapperClassName={inputWrapperClassName}
      labelClassName={labelClassName}
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
