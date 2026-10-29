import { useEffect, useRef, useState } from 'react'
import { convictedService } from '../services/convictedService'

const hiddenState = { cpf: null, isLoading: false, error: null }

// The owning ConvictedCpf component keys this local state by record and session.
export function useConvictedCpf(id) {
  const [state, setState] = useState(hiddenState)
  const request = useRef(null)

  useEffect(
    () => () => {
      request.current?.abort()
      request.current = null
    },
    []
  )

  const hide = () => {
    request.current?.abort()
    request.current = null
    setState(hiddenState)
  }

  const reveal = async () => {
    if (!id || request.current) return
    const controller = new AbortController()
    request.current = controller
    setState({ cpf: null, isLoading: true, error: null })
    try {
      const cpf = await convictedService.getCpf(id, { signal: controller.signal })
      if (request.current === controller && !controller.signal.aborted)
        setState({ cpf, isLoading: false, error: null })
    } catch (error) {
      if (request.current === controller && !controller.signal.aborted)
        setState({
          cpf: null,
          isLoading: false,
          error:
            error.name === 'AbortError'
              ? null
              : 'Não foi possível visualizar o CPF. Tente novamente.',
        })
    } finally {
      if (request.current === controller) request.current = null
    }
  }

  return { ...state, reveal, hide }
}
