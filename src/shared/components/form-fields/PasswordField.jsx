import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { InputField } from '@/shared/components/form-fields/InputField'
import { cn } from '@/shared/lib/utils'

export function PasswordField({
  id,
  label,
  error,
  registration,
  value,
  onChange,
  disabled,
  variant = 'default',
  className,
  ...props
}) {
  const [visible, setVisible] = useState(false)

  return (
    <InputField
      id={id}
      label={label}
      error={error}
      disabled={disabled}
      registration={registration}
      value={value}
      onChange={onChange}
      type={visible ? 'text' : 'password'}
      className={cn(
        variant === 'auth' && 'h-13 rounded-[8px] border-2 px-3 py-4 text-sm',
        'pr-12',
        className
      )}
      rightElement={
        <button
          type="button"
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 p-1 focus-visible:outline-none"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
      {...props}
    />
  )
}
