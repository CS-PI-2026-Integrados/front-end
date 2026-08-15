import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

const inputBaseStyles =
  'h-9 w-full rounded-md border bg-transparent px-2.5 py-1 text-base text-foreground shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
const inputDefaultStyles = 'border-input dark:bg-input/30'
const inputErrorStyles =
  'border-destructive aria-invalid:border-destructive dark:border-destructive/50 dark:aria-invalid:border-destructive/50'

export function InputField({
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
    <Field data-invalid={error ? true : undefined} className={cn('gap-1', fieldClassName)}>
      {labelAction ? (
        <div className="flex justify-between">
          <FieldLabel htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
            {label}
          </FieldLabel>
          {labelAction}
        </div>
      ) : (
        <FieldLabel htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
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

      {error ? (
        <FieldError className={cn('mt-1 min-h-5 text-sm', errorClassName)}>{error}</FieldError>
      ) : (
        <span aria-hidden="true" className={cn('mt-1 block min-h-5 text-sm', errorClassName)} />
      )}
    </Field>
  )
}
