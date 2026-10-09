import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { convictedService } from '../services/convictedService'
import {
  convictedCreateSchema,
  convictedUpdateSchema,
  zipCodeSchema,
} from '../schemas/convictedSchema'
import { compressImage, photoSchema } from '@/shared/lib/image'
import { formatCpf } from '@/shared/lib/cpf'

export function convictedToFormState(convicted) {
  return {
    name: convicted?.name || convicted?.fullName || '',
    cpf: formatCpf(convicted?.cpf || ''),
    birthDate: convicted?.birthDate?.slice(0, 10) || '',
    phone: convicted?.phone || '',
    employmentStatus: convicted?.employmentStatus || '',
    processes: (convicted?.processes || []).map((process) => ({
      ...process,
      principal: Boolean(process.principal),
    })),
    address: {
      zipCode: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      ...convicted?.address,
    },
    photo: null,
  }
}

export function useConvictedForm(convicted = null, { onSuccess, photoUrl, open = true } = {}) {
  const isEditing = Boolean(convicted?.id)
  const form = useForm({
    defaultValues: convictedToFormState(convicted),
    resolver: zodResolver(isEditing ? convictedUpdateSchema : convictedCreateSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const { reset, getValues, setValue, setError, clearErrors, trigger, handleSubmit, control } = form
  const { isSubmitted } = form.formState
  const photo = useWatch({ control, name: 'photo' })
  const fileRef = useRef(null)
  const alive = useRef(false)
  const generation = useRef(0)
  const pending = useRef(false)
  const cepRequest = useRef(null)
  const [localPreview, setLocalPreview] = useState(null)
  const [isSearchingCep, setSearchingCep] = useState(false)
  const [isProcessingPhoto, setProcessingPhoto] = useState(false)
  const [error, setErrorMessage] = useState(null)
  // Keep the opening snapshot stable; later photo loads and same-record refreshes must not reset a draft.
  const initialRecord = useRef(convicted)
  useEffect(() => {
    initialRecord.current = convicted
  }, [convicted])
  useEffect(() => {
    alive.current = open
    generation.current += 1
    reset(convictedToFormState(initialRecord.current))
    setLocalPreview(null)
    setSearchingCep(false)
    setProcessingPhoto(false)
    setErrorMessage(null)
    if (fileRef.current) fileRef.current.value = ''
    return () => {
      alive.current = false
      generation.current += 1
      cepRequest.current?.abort()
    }
  }, [open, convicted?.id, reset])

  const setFieldValue = useCallback(
    (name, value) => {
      setValue(name, value, { shouldDirty: true, shouldTouch: true, shouldValidate: isSubmitted })
    },
    [isSubmitted, setValue]
  )

  const handleFoto = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    clearErrors('photo')
    setFieldValue('photo', file)
    setLocalPreview(null)
    setProcessingPhoto(false)
    const validation = photoSchema.safeParse(file)
    if (!validation.success) {
      setError('photo', { message: validation.error.issues[0].message })
      event.target.value = ''
      return
    }
    setProcessingPhoto(true)
    const started = generation.current
    try {
      const preview = await compressImage(file, 300, 300, 0.8)
      if (alive.current && generation.current === started && getValues('photo') === file) {
        if (!preview) throw new Error('Photo preview unavailable')
        setLocalPreview(preview)
      }
    } catch {
      if (alive.current && generation.current === started && getValues('photo') === file)
        setError('photo', { message: 'Não foi possível preparar a foto. Selecione outra imagem.' })
    } finally {
      if (alive.current && generation.current === started && getValues('photo') === file)
        setProcessingPhoto(false)
    }
  }
  const removerFoto = () => {
    setFieldValue('photo', null)
    if (!isSubmitted) clearErrors('photo')
    setLocalPreview(null)
    setProcessingPhoto(false)
    if (fileRef.current) fileRef.current.value = ''
  }
  const buscarCep = async () => {
    const zipCode = getValues('address.zipCode')
    const parsed = zipCodeSchema.safeParse(zipCode)
    if (!parsed.success) {
      setError('address.zipCode', { message: parsed.error.issues[0].message })
      return
    }
    cepRequest.current?.abort()
    const controller = new AbortController()
    cepRequest.current = controller
    const started = generation.current
    const before = { ...getValues('address') }
    const current = () =>
      alive.current &&
      !controller.signal.aborted &&
      generation.current === started &&
      cepRequest.current === controller &&
      getValues('address.zipCode') === zipCode
    setSearchingCep(true)
    try {
      const address = await convictedService.searchCep(zipCode, { signal: controller.signal })
      if (!current()) return
      if (!address) {
        setError('address.zipCode', { message: 'CEP não encontrado.' })
        return
      }
      clearErrors('address.zipCode')
      for (const key of ['street', 'neighborhood', 'city', 'state']) {
        if (address[key] && getValues(`address.${key}`) === before[key])
          setFieldValue(`address.${key}`, address[key])
      }
    } catch (error) {
      if (current() && error.name !== 'AbortError')
        setError('address.zipCode', { message: 'Erro ao consultar CEP. Preencha manualmente.' })
    } finally {
      if (alive.current && generation.current === started && cepRequest.current === controller)
        setSearchingCep(false)
    }
  }

  const save = async (data, callback) => {
    if (pending.current) return false
    pending.current = true
    setErrorMessage(null)
    const started = generation.current
    try {
      const result = isEditing
        ? await convictedService.update(convicted.id, data)
        : await convictedService.create(data)
      if (data.photo) await convictedService.uploadPhoto(result.id, data.photo)
      if (!alive.current || generation.current !== started) return result
      toast.success(
        isEditing ? 'Apenado atualizado com sucesso!' : 'Apenado cadastrado com sucesso!'
      )
      await (callback || onSuccess)?.(result)
      return result
    } catch (error) {
      if (alive.current && generation.current === started) {
        for (const field of error.fields || [])
          setError(field.field, { type: 'server', message: field.message })
        setErrorMessage(error.message || 'Erro ao salvar os dados do apenado.')
      }
      return false
    } finally {
      pending.current = false
    }
  }
  // Preserve the existing programmatic submit contract for non-visual consumers/tests.
  const submit = async (callback) => {
    let result = false
    await handleSubmit(async (data) => {
      result = await save(data, callback)
    })()
    return result
  }
  return {
    form,
    fileRef,
    isEditing,
    isSearchingCep,
    isProcessingPhoto,
    error,
    preview: photo ? localPreview : photoUrl || convicted?.photoUrl || null,
    isSubmitting: form.formState.isSubmitting,
    actions: { setFieldValue, handleFoto, removerFoto, buscarCep, submit, validate: trigger },
  }
}
