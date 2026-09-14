import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { convictedService } from '@/features/convicteds/services/convictedService'
import { validateConvictedForm } from '@/features/convicteds/schemas/convictedSchema'
import { compressImage } from '@/shared/lib/image'

export const INITIAL_CONVICTED_FORM = {
  name: '',
  cpf: '',
  birthDate: '',
  phone: '',
  employmentStatus: '',
  address: {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  },
  photo: null,
}

export function convictedToFormState(convicted) {
  if (!convicted) return INITIAL_CONVICTED_FORM

  return {
    name: convicted.name || convicted.fullName || '',
    cpf: convicted.cpf || '',
    birthDate: convicted.birthDate ? String(convicted.birthDate).substring(0, 10) : '',
    phone: convicted.phone || '',
    employmentStatus: convicted.employmentStatus || '',
    address: {
      zipCode: convicted.address?.zipCode || '',
      street: convicted.address?.street || '',
      number: convicted.address?.number || '',
      complement: convicted.address?.complement || '',
      neighborhood: convicted.address?.neighborhood || '',
      city: convicted.address?.city || '',
      state: convicted.address?.state || '',
    },
    photo: null,
  }
}

export function useConvictedForm(convicted = null, { onSuccess } = {}) {
  const isEditing = Boolean(convicted?.id)
  const fileRef = useRef(null)

  const [form, setForm] = useState(() => convictedToFormState(convicted))
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(convicted?.photoUrl || null)
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sincroniza se a prop convicted mudar
  useEffect(() => {
    setForm(convictedToFormState(convicted))
    setPreview(convicted?.photoUrl || null)
    setErrors({})
  }, [convicted])

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev
      const updated = { ...prev }
      delete updated[field]
      return updated
    })
  }, [])

  const setFieldValue = useCallback(
    (name, value) => {
      if (name.startsWith('address.')) {
        const addressKey = name.replace('address.', '')
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [addressKey]: value,
          },
        }))
        clearFieldError(name)
        return
      }

      setForm((prev) => ({ ...prev, [name]: value }))
      clearFieldError(name)
    },
    [clearFieldError]
  )

  const handleAddressChange = useCallback(
    (key, value) => {
      setFieldValue(`address.${key}`, value)
    },
    [setFieldValue]
  )

  const handleChange = useCallback(
    (event) => {
      const { name, value } = event.target
      setFieldValue(name, value)
    },
    [setFieldValue]
  )

  const handleSelect = useCallback(
    (name, value) => {
      setFieldValue(name, value)
    },
    [setFieldValue]
  )

  const handleMask = useCallback(
    (name, value) => {
      setFieldValue(name, value)
    },
    [setFieldValue]
  )

  const handleFoto = useCallback(
    async (event) => {
      const file = event.target.files?.[0]
      if (!file) return

      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          photo: 'Formato inválido. Use JPG, PNG ou WEBP.',
        }))
        return
      }

      const maxSize = 5 * 1024 * 1024 // 5 MB
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          photo: 'A foto deve ter no máximo 5 MB.',
        }))
        return
      }

      setForm((prev) => ({ ...prev, photo: file }))
      clearFieldError('photo')

      try {
        const compressed = await compressImage(file, 300, 300, 0.8)
        setPreview(compressed || null)
      } catch {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target?.result || null)
        reader.readAsDataURL(file)
      }
    },
    [clearFieldError]
  )

  const removerFoto = useCallback(() => {
    setForm((prev) => ({ ...prev, photo: null }))
    setPreview(null)
    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }, [])

  const buscarCep = useCallback(async () => {
    const cleanCep = (form.address?.zipCode || '').replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      setErrors((prev) => ({
        ...prev,
        'address.zipCode': 'O CEP deve conter 8 dígitos.',
      }))
      return
    }

    setIsSearchingCep(true)
    try {
      const result = await convictedService.searchCep(cleanCep)
      if (result) {
        setForm((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            street: result.street || prev.address.street,
            neighborhood: result.neighborhood || prev.address.neighborhood,
            city: result.city || prev.address.city,
            state: result.state || prev.address.state,
          },
        }))
        clearFieldError('address.zipCode')
        clearFieldError('address.street')
        clearFieldError('address.neighborhood')
        clearFieldError('address.city')
        clearFieldError('address.state')
      } else {
        setErrors((prev) => ({
          ...prev,
          'address.zipCode': 'CEP não encontrado.',
        }))
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        'address.zipCode': 'Erro ao consultar CEP. Preencha manualmente.',
      }))
    } finally {
      setIsSearchingCep(false)
    }
  }, [clearFieldError, form.address?.zipCode])

  const validate = useCallback(() => {
    const validationErrors = validateConvictedForm(form, { isEditing, preview })
    setErrors(validationErrors)
    return validationErrors
  }, [form, isEditing, preview])

  const submit = useCallback(
    async (callback) => {
      const validationErrors = validate()
      if (Object.keys(validationErrors).length > 0) {
        toast.error('Preencha os campos obrigatórios destacados.')
        return false
      }

      setIsSubmitting(true)
      try {
        let result
        if (isEditing) {
          result = await convictedService.update(convicted.id, form)
          if (form.photo) {
            result = await convictedService.uploadPhoto(convicted.id, form.photo)
          }
          toast.success('Apenado atualizado com sucesso!')
        } else {
          result = await convictedService.create(form)
          if (form.photo) {
            result = await convictedService.uploadPhoto(result.id, form.photo)
          }
          toast.success('Apenado cadastrado com sucesso!')
        }

        const notify = callback || onSuccess
        if (typeof notify === 'function') {
          notify(result)
        }
        return result
      } catch (err) {
        const message = err?.message || 'Erro ao salvar os dados do apenado.'
        toast.error(message)
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [convicted?.id, form, isEditing, onSuccess, validate]
  )

  const resetForm = useCallback(() => {
    setForm(convictedToFormState(convicted))
    setPreview(convicted?.photoUrl || null)
    setErrors({})
    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }, [convicted])

  return {
    form,
    errors,
    setErrors,
    preview,
    fileRef,
    isEditing,
    isSubmitting,
    isSearchingCep,
    buscandoCep: isSearchingCep, // retrocompatibilidade
    actions: {
      handleChange,
      handleSelect,
      handleMask,
      handleAddressChange,
      setFieldValue,
      handleFoto,
      removerFoto,
      buscarCep,
      validate,
      submit,
      tentarSalvar: submit, // retrocompatibilidade
      resetForm,
    },
  }
}
