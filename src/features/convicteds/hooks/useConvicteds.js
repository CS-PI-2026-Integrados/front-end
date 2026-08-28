import { useCallback, useEffect, useState } from 'react'
import { convictedService } from '@/features/convicteds/services/convictedService'

export function useApenados() {
  const [apenados, setApenados] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    convictedService
      .list({ signal: controller.signal })
      .then((items) => {
        if (active) {
          setApenados(items)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [])

  const atualizar = useCallback((proximo) => {
    setApenados(proximo)
  }, [])

  return { apenados, atualizar, loading }
}

export function useApenado(id) {
  const [apenado, setApenado] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    let active = true

    convictedService
      .getById(id, { signal: controller.signal })
      .then((item) => {
        if (active) {
          setApenado(item)
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [id])

  return { apenado, loading }
}
