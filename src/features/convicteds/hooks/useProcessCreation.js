import { useEffect, useRef, useState } from 'react'
import { processService } from '../services/processService'

export function useProcessCreation() {
  const [isCreating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const active = useRef(false)
  const pending = useRef(false)
  const generation = useRef(0)

  useEffect(() => {
    active.current = true
    generation.current += 1
    return () => {
      active.current = false
      generation.current += 1
    }
  }, [])

  const create = async (number) => {
    if (pending.current) return null
    pending.current = true
    setCreating(true)
    setError(null)
    const started = generation.current
    try {
      const process = await processService.create(number)
      return active.current && started === generation.current ? process : null
    } catch (failure) {
      if (active.current && started === generation.current)
        setError(
          failure.fields?.find((field) => field.field === 'number')?.message ||
            failure.message ||
            'Não foi possível cadastrar o processo. Tente novamente.'
        )
      return null
    } finally {
      pending.current = false
      if (active.current && started === generation.current) setCreating(false)
    }
  }

  return { create, isCreating, error, clearError: () => setError(null) }
}
