import { useCallback } from 'react'
import { useTenant } from '@/features/instituicoes/context/tenantContext'

export function useReceiptConfig() {
  const { state, dispatch } = useTenant()

  const handleToggle = useCallback(
    (field) => {
      dispatch({ type: 'TOGGLE_RECEIPT', payload: { field } })
    },
    [dispatch]
  )

  const handleFieldConfig = useCallback(
    (key, prop, value) => {
      dispatch({ type: 'UPDATE_FIELD_CONFIG', payload: { key, prop, value } })
    },
    [dispatch]
  )

  return {
    receiptConfig: state.receiptConfig,
    receiptFields: state.receiptFields,
    handleToggle,
    handleFieldConfig,
  }
}
