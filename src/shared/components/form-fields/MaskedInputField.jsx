import { IMaskMixin } from 'react-imask'
import { Input } from '@/shared/components/ui/input'
import { FieldLayout } from './FieldLayout'
const MaskedInput = IMaskMixin(({ inputRef, ...props }) => <Input {...props} ref={inputRef} />)
export function MaskedInputField({ field, mask, placeholder, action, ...props }) {
  return (
    <FieldLayout {...props}>
      {(controls) => (
        <div className="flex gap-1.5">
          <MaskedInput
            {...controls}
            inputRef={field.ref}
            name={field.name}
            value={field.value || ''}
            onBlur={field.onBlur}
            mask={mask}
            unmask={false}
            onAccept={(value) => field.onChange(value)}
            placeholder={placeholder}
          />
          {action}
        </div>
      )}
    </FieldLayout>
  )
}
