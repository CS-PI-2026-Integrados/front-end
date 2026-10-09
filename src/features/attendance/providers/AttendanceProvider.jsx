import { useMemo, useState, useCallback } from 'react'
import { AtendimentoContext } from '../context/attendanceContext'

export function AtendimentoProvider({ children }) {
  const [convicted, setConvicted] = useState(null)
  const [process, setProcess] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [canEdit, setCanEdit] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const selectConvicted = useCallback((person) => {
    setConvicted(person)
    setProcess(person?.processes?.find((item) => item.status === 'ACTIVE') || null)
    setPhoto(null)
    setReceipt(null)
    setCanEdit(false)
    setAddressError(null)
    setHasSubmitted(false)
  }, [])
  const updateField = useCallback(
    (key, value) =>
      setConvicted((previous) => (previous ? { ...previous, [key]: value } : previous)),
    []
  )
  const reset = useCallback(() => {
    selectConvicted(null)
  }, [selectConvicted])
  const value = useMemo(
    () => ({
      convicted,
      process,
      photo,
      canEdit,
      addressError,
      hasSubmitted,
      setHasSubmitted,
      receipt,
      selectConvicted,
      selectProcess: setProcess,
      setPhoto,
      setCanEdit,
      setAddressError,
      setReceipt,
      updateField,
      reset,
    }),
    [
      convicted,
      process,
      photo,
      canEdit,
      addressError,
      hasSubmitted,
      receipt,
      selectConvicted,
      updateField,
      reset,
    ]
  )
  return <AtendimentoContext.Provider value={value}>{children}</AtendimentoContext.Provider>
}
