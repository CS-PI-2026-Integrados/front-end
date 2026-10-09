import { useState } from 'react'
import { receiptAddressSchema } from '../schemas/receiptAddressSchema'

export function useReceiptAddressField({ address, onChange, onError }) {
  const [value, setValue] = useState(() =>
    [
      [address?.street, address?.number].filter(Boolean).join(' '),
      address?.complement,
      address?.neighborhood,
      address?.city,
      address?.state,
    ]
      .filter(Boolean)
      .join(' · ')
  )
  const [error, setError] = useState(null)
  const changeValue = (nextValue) => {
    setValue(nextValue)
    const result = receiptAddressSchema.safeParse(nextValue)
    const nextError = result.success ? null : result.error.issues[0].message
    setError(nextError)
    onError(nextError)
    if (result.success) onChange({ ...address, ...result.data })
  }
  return { value, error, changeValue }
}
