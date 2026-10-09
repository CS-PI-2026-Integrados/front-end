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
  const [zipCode, setZipCode] = useState(() => address?.zipCode || '')
  const [errors, setErrors] = useState({})
  const changeAddress = (nextValue, nextZipCode) => {
    setValue(nextValue)
    setZipCode(nextZipCode)
    const result = receiptAddressSchema.safeParse({ address: nextValue, zipCode: nextZipCode })
    const issues = result.success ? [] : result.error.issues
    setErrors(Object.fromEntries(issues.map((issue) => [issue.path[0], issue.message])))
    onError(issues.map((issue) => issue.message).join(' ') || null)
    if (result.success) onChange(result.data)
  }
  return {
    value,
    zipCode,
    error: errors.address,
    zipCodeError: errors.zipCode,
    changeValue: (nextValue) => changeAddress(nextValue, zipCode),
    changeZipCode: (nextZipCode) => changeAddress(value, nextZipCode),
  }
}
