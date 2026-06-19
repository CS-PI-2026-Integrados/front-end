import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const inputBaseStyles =
  'h-13 w-full rounded-[8px] border-2 px-3 py-4 text-sm text-black transition-colors outline-none placeholder:text-gray-300 disabled:bg-gray-100 disabled:opacity-70'
const inputDefaultStyles =
  'border-gray-400 focus-visible:border-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-500'
const inputErrorStyles =
  'border-red-500 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500'

export function AuthInputField({
  id,
  label,
  labelAction,
  error,
  disabled,
  registration,
  rightElement,
  className,
  fieldClassName,
  inputWrapperClassName,
  labelClassName,
  errorClassName,
  ...inputProps
}) {
  return (
    <Field className={cn('gap-1', fieldClassName)}>
      {labelAction ? (
        <div className="flex justify-between">
          <FieldLabel
            htmlFor={id}
            className={cn('text-lg font-normal text-gray-600', labelClassName)}
          >
            {label}
          </FieldLabel>
          {labelAction}
        </div>
      ) : (
        <FieldLabel
          htmlFor={id}
          className={cn('text-lg font-normal text-gray-600', labelClassName)}
        >
          {label}
        </FieldLabel>
      )}

      <div className={cn(rightElement && 'relative mt-1', inputWrapperClassName)}>
        <Input
          id={id}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          {...inputProps}
          {...registration}
          className={cn(inputBaseStyles, error ? inputErrorStyles : inputDefaultStyles, className)}
        />
        {rightElement}
      </div>

      <span className={cn('mt-1 block min-h-5 text-sm text-red-500', errorClassName)}>
        {error || ''}
      </span>
    </Field>
  )
}
