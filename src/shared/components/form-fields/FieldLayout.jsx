import { useId } from 'react'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { cn } from '@/shared/lib/utils'

export function FieldLayout({
  id: suppliedId,
  label,
  labelAction,
  error,
  description,
  required,
  disabled,
  variant = 'default',
  fieldClassName,
  labelClassName,
  errorClassName,
  children,
}) {
  const generatedId = useId()
  const id = suppliedId || generatedId
  const compact = variant === 'modal'
  const controls = {
    id,
    disabled,
    'aria-required': required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby':
      [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') ||
      undefined,
  }
  const labelContent = (
    <FieldLabel htmlFor={id} className={cn('text-sm font-medium', labelClassName)}>
      {label}
      {required && <span className="text-destructive">*</span>}
    </FieldLabel>
  )
  return (
    <Field data-invalid={error ? true : undefined} className={cn('gap-1', fieldClassName)}>
      {labelAction ? (
        <div className="flex justify-between">
          {labelContent}
          {labelAction}
        </div>
      ) : (
        labelContent
      )}
      {children(controls)}
      {description && (
        <FieldDescription id={`${id}-description`} className="text-xs">
          {description}
        </FieldDescription>
      )}
      {error ? (
        <FieldError
          id={`${id}-error`}
          className={cn(compact ? 'min-h-4 text-xs' : 'mt-1 min-h-5 text-sm', errorClassName)}
        >
          {error}
        </FieldError>
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            compact ? 'block min-h-4 text-xs' : 'mt-1 block min-h-5 text-sm',
            errorClassName
          )}
        />
      )}
    </Field>
  )
}
