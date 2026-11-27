import { useMemo, useState, useCallback } from 'react'
import { AtendimentoContext } from '../context/attendanceContext'

export function AtendimentoProvider({ children }) {
  const [convicted, setConvicted] = useState(null)
  const [process, setProcess] = useState(null)
  const [noProcessDeclared, setNoProcessDeclared] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [canEdit, setCanEdit] = useState(false)
  const [addressError, setAddressError] = useState(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [receipt, setReceipt] = useState(null)
  const selectConvicted = useCallback((person) => {
    setConvicted(person)
    setProcess(person?.processes?.find((item) => item.status === 'ACTIVE') || null)
    setNoProcessDeclared(person?.noProcessDeclared === true && person.processes.length === 0)
    setPhoto(null)
    setReceipt(null)
    setCanEdit(false)
    setAddressError(null)
    setHasSubmitted(false)
  }, [])
  const declareNoProcess = useCallback(
    (declared) => {
      if (!convicted || convicted.processes.length > 0) return
      setNoProcessDeclared(declared === true)
      if (declared === true) setProcess(null)
    },
    [convicted]
  )
  const selectProcess = useCallback((selected) => {
    setProcess(selected)
    if (selected) setNoProcessDeclared(false)
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
      selectProcess,
      noProcessDeclared,
      declareNoProcess,
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
      selectProcess,
      noProcessDeclared,
      declareNoProcess,
      updateField,
      reset,
    ]
  )
  return <AtendimentoContext.Provider value={value}>{children}</AtendimentoContext.Provider>
}
