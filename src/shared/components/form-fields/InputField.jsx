import { FieldLayout } from './FieldLayout'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'
export function InputField({
  id,
  label,
  labelAction,
  error,
  description,
  required,
  disabled,
  registration,
  rightElement,
  variant,
  className,
  fieldClassName,
  inputWrapperClassName,
  labelClassName,
  errorClassName,
  ...inputProps
}) {
  return (
    <FieldLayout
      {...{
        id,
        label,
        labelAction,
        error,
        description,
        required,
        disabled,
        variant,
        fieldClassName,
        labelClassName,
        errorClassName,
      }}
    >
      {(controls) => (
        <div className={cn(rightElement && 'relative mt-1', inputWrapperClassName)}>
          <Input
            {...inputProps}
            {...registration}
            {...controls}
            className={cn('text-foreground', className)}
          />
          {rightElement}
        </div>
      )}
    </FieldLayout>
  )
}
