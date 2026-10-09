import { FieldLayout } from './FieldLayout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'

export function SelectField({ field, options, placeholder = 'Selecione', contentProps, ...props }) {
  return (
    <FieldLayout {...props}>
      {(controls) => (
        <Select
          value={field.value || ''}
          onValueChange={field.onChange}
          onOpenChange={(open) => {
            if (!open) field.onBlur()
          }}
          disabled={controls.disabled}
        >
          <SelectTrigger {...controls} ref={field.ref} onBlur={field.onBlur} className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent {...contentProps}>
            {options.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FieldLayout>
  )
}
