import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useReceiptAddressField } from '../hooks/useReceiptAddressField'

export function ReceiptAddressField({
  address,
  disabled,
  onChange,
  onError,
  error,
  showErrors = false,
}) {
  const field = useReceiptAddressField({ address, onChange, onError })
  const message = (showErrors && field.error) || error
  return (
    <div className="space-y-1.5">
      <Label htmlFor="attendance-address">Endereço</Label>
      <Input
        id="attendance-address"
        value={field.value}
        disabled={disabled}
        aria-invalid={Boolean(message)}
        aria-describedby={message ? 'attendance-address-error' : undefined}
        onChange={(event) => field.changeValue(event.target.value)}
      />
      {message && (
        <p id="attendance-address-error" role="alert" className="text-destructive text-xs">
          {message}
        </p>
      )}
    </div>
  )
}
