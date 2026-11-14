import { useState, useCallback, useRef } from 'react'
import { useTenant } from '@/features/institutions/context/tenantContext'
import {
  validateLogoFile,
  convertFileToBase64,
  MAX_FIELD_LENGTH,
} from '@/features/institutions/services/tenantService'
import toast from 'react-hot-toast'

const LOGO_REMOVED_SENTINEL = '__REMOVED__'

export function useInstitutionForm() {
  const { state: tenantState } = useTenant()

  const [nomeComarca, setNomeComarca] = useState(tenantState.nomeComarca || '')
  const [unidade, setUnidade] = useState(tenantState.unidade || '')
  const [endereco, setEndereco] = useState(tenantState.endereco || '')

  const [logoPreview, setLogoPreview] = useState(tenantState.logo || null)
  const [pendingLogoBase64, setPendingLogoBase64] = useState(null)
  const [logoError, setLogoError] = useState(null)

  const [fieldErrors, setFieldErrors] = useState({})
  const isSaving = false

  const fileInputRef = useRef(null)

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

    toast.error('O salvamento das configurações institucionais ainda não está disponível.')
  }, [nomeComarca, endereco])

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
