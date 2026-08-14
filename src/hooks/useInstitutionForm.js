import { useState, useCallback, useRef, useEffect } from 'react'
import { useTenant } from '@/features/instituicoes/context/tenantContext'
import {
  validateLogoFile,
  validateLogoOnServer,
  convertFileToBase64,
  MAX_FIELD_LENGTH,
} from '@/services/tenantService'
import toast from 'react-hot-toast'

const LOGO_REMOVED_SENTINEL = '__REMOVED__'

export function useInstitutionForm() {
  const { state: tenantState, dispatch } = useTenant()

  const [nomeComarca, setNomeComarca] = useState('')
  const [unidade, setUnidade] = useState('')
  const [endereco, setEndereco] = useState('')

  const [logoPreview, setLogoPreview] = useState(null)
  const [pendingLogoBase64, setPendingLogoBase64] = useState(null)
  const [logoError, setLogoError] = useState(null)

  const [fieldErrors, setFieldErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!tenantState.isLoaded) return

    setNomeComarca(tenantState.nomeComarca || '')
    setUnidade(tenantState.unidade || '')
    setEndereco(tenantState.endereco || '')
    setLogoPreview(tenantState.logo || null)
    setPendingLogoBase64(null)
  }, [
    tenantState.isLoaded,
    tenantState.nomeComarca,
    tenantState.unidade,
    tenantState.endereco,
    tenantState.logo,
  ])

  const handleFieldChange = useCallback((field, value) => {
    if (value.length > MAX_FIELD_LENGTH) return

    const setterMap = {
      nomeComarca: setNomeComarca,
      unidade: setUnidade,
      endereco: setEndereco,
    }

    setterMap[field]?.(value)

    setFieldErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  const handleFileSelect = useCallback(async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const clientResult = validateLogoFile(file)
    if (!clientResult.valid) {
      setLogoError(clientResult.error)
      toast.error(clientResult.error)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setLogoError(null)

    try {
      const base64 = await convertFileToBase64(file)
      setLogoPreview(base64)
      setPendingLogoBase64(base64)
    } catch {
      const errorMsg = 'Falha ao processar a imagem. Tente novamente.'
      setLogoError(errorMsg)
      toast.error(errorMsg)
    }
  }, [])

  const handleRemoveLogo = useCallback(() => {
    setLogoPreview(null)
    setPendingLogoBase64(LOGO_REMOVED_SENTINEL)
    setLogoError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleSave = useCallback(async () => {
    const errors = {}
    if (!nomeComarca.trim()) {
      errors.nomeComarca = 'Nome da comarca é obrigatório'
    }
    if (!endereco.trim()) {
      errors.endereco = 'Endereço completo é obrigatório'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error('Corrija os campos destacados antes de salvar')
      return
    }

    setIsSaving(true)

    try {
      if (pendingLogoBase64 && pendingLogoBase64 !== LOGO_REMOVED_SENTINEL) {
        const serverResult = await validateLogoOnServer(pendingLogoBase64)
        if (!serverResult.valid) {
          setLogoError(serverResult.error)
          toast.error(serverResult.error)
          setIsSaving(false)
          return
        }
      }

      dispatch({
        type: 'SET_UNIT_DATA',
        payload: {
          nomeComarca: nomeComarca.trim(),
          unidade: unidade.trim(),
          endereco: endereco.trim(),
        },
      })

      if (pendingLogoBase64 === LOGO_REMOVED_SENTINEL) {
        dispatch({ type: 'SET_LOGO', payload: null })
      } else if (pendingLogoBase64) {
        dispatch({ type: 'SET_LOGO', payload: pendingLogoBase64 })
      }

      setPendingLogoBase64(null)
      setFieldErrors({})
      setLogoError(null)
      toast.success('Configurações salvas')
    } catch {
      toast.error('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }, [nomeComarca, unidade, endereco, pendingLogoBase64, dispatch])

  const hasChanges = (() => {
    const nameChanged = nomeComarca.trim() !== (tenantState.nomeComarca || '')
    const unitChanged = unidade.trim() !== (tenantState.unidade || '')
    const addressChanged = endereco.trim() !== (tenantState.endereco || '')
    const logoChanged = pendingLogoBase64 !== null

    return nameChanged || unitChanged || addressChanged || logoChanged
  })()

  return {
    nomeComarca,
    unidade,
    endereco,
    logoPreview,
    logoError,
    fieldErrors,
    isSaving,
    hasChanges,
    fileInputRef,
    maxFieldLength: MAX_FIELD_LENGTH,
    handleFieldChange,
    handleFileSelect,
    handleRemoveLogo,
    handleSave,
  }
}
