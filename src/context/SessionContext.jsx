import React, { createContext, useContext, useEffect, useState } from 'react'

const SessionContext = createContext()

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Deverá consumir as informações da session
    // que ficarão armazenadas no accessToken e
    // disponibilizar elas no context

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession({
      tenant: {
        id: '1',
        name: 'Minha Comarca',
        logo: 'base64...',
      },
      user: {
        name: 'Marina da Silva',
      },
    })
  }, [setSession])

  return <SessionContext.Provider value={{ session }}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession deve ser usado dentro de SessionProvider')
  }
  return context
}
