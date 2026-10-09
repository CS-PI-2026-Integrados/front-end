import { useForm } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema } from '@/features/users/schemas/userSchemas'

export function useCreateOperatorForm({ onCreate, onOpenChange, open = true }) {
  const active = useRef(false)
  const pending = useRef(false)
  const generation = useRef(0)
  const [error, setErrorMessage] = useState(null)
  const form = useForm({
    defaultValues: { name: '', cpf: '', email: '', roleKey: '', password: '' },
    resolver: zodResolver(createUserSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const { reset } = form
  useEffect(() => {
    active.current = open
    generation.current += 1
    reset()
    setErrorMessage(null)
    return () => {
      active.current = false
      generation.current += 1
    }
  }, [open, reset])
  const submitOperator = async (data) => {
    if (pending.current) return
    pending.current = true
    const started = generation.current
    setErrorMessage(null)
    try {
      await onCreate(data)
      if (!active.current || generation.current !== started) return
      form.reset()
      onOpenChange(false)
    } catch (cause) {
      if (!active.current || generation.current !== started) return
      for (const field of cause.fields || [])
        form.setError(field.field, { type: 'server', message: field.message })
      if (cause.field) form.setError(cause.field, { type: 'server', message: cause.message })
      else setErrorMessage(cause.message || 'Não foi possível cadastrar o usuário.')
    } finally {
      pending.current = false
    }
  }

  const handleOpenChange = (nextOpen) => {
    if (pending.current) return
    if (!nextOpen) {
      form.reset()
    }

    onOpenChange(nextOpen)
  }

  return {
    form,
    error,
    handleOpenChange,
    submitOperator,
  }
}
