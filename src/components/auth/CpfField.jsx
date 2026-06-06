import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const inputBaseStyles =
  'h-13 w-full rounded-[8px] border-2 px-3 py-4 text-sm text-black transition-colors outline-none placeholder:text-gray-300 disabled:bg-gray-100 disabled:opacity-70'
const inputDefaultStyles =
  'border-gray-400 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500'
const inputErrorStyles =
  'border-red-500 focus-visible:ring-red-500 focus-visible:ring-2 focus-visible:border-red-500'

export function CpfField({
  id = 'cpf',
  label = 'CPF',
  error,
  disabled,
  registration,
  formatCpf,
  className,
}) {
  const { onChange, ...restRegistration } = registration

  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="text-lg font-normal text-gray-600">
        {label}
      </FieldLabel>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="000.000.000-00"
        {...restRegistration}
        onChange={(event) => {
          event.target.value = formatCpf(event.target.value)
          onChange(event)
        }}
        disabled={disabled}
        className={`${inputBaseStyles} ${error ? inputErrorStyles : inputDefaultStyles} ${className || ''}`}
      />
      <span className="mt-1 block min-h-5 text-sm text-red-500">{error || ''}</span>
    </Field>
  )
}
