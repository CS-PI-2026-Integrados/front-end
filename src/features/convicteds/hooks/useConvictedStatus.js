import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { convictedService } from '../services/convictedService'

export function useConvictedStatus() {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const mounted = useRef(false)
  const request = useRef(null)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      request.current?.abort()
    }
  }, [])

  const updateStatus = async (id, status) => {
    if (!id || request.current) return false
    const controller = new AbortController()
    request.current = controller
    setIsSaving(true)
    setError(null)
    try {
      const updated = await convictedService.updateStatus(id, status, { signal: controller.signal })
      if (!mounted.current || controller.signal.aborted) return false
      toast.success(
        status === 'ACTIVE' ? 'Apenado ativado com sucesso!' : 'Apenado inativado com sucesso!'
      )
      return updated
    } catch (cause) {
      if (mounted.current && !controller.signal.aborted) {
        const message = cause?.message || 'Erro ao alterar o status do apenado.'
        setError(message)
        toast.error(message)
      }
      return false
    } finally {
      if (request.current === controller) request.current = null
      if (mounted.current) setIsSaving(false)
    }
  }

  return { updateStatus, isSaving, error }
}
