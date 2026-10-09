import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { InputField } from '@/shared/components/form-fields/InputField'
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
    <div className="space-y-3">
      <InputField
        id="attendance-zip-code"
        label="CEP"
        required
        variant="modal"
        inputMode="numeric"
        maxLength={9}
        placeholder="00000-000"
        value={field.zipCode}
        disabled={disabled}
        error={showErrors ? field.zipCodeError : undefined}
        onChange={(event) => field.changeZipCode(event.target.value)}
      />
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
    </div>
  )
}
