import { createContext, useContext } from 'react'

export const AtendimentoContext = createContext(null)

/** Returns the route-scoped state and commands for an attendance flow. */
export function useAtendimento() {
  const context = useContext(AtendimentoContext)

  if (!context) {
    throw new Error('useAtendimento deve ser usado dentro de um AtendimentoProvider')
  }

  return context
}
