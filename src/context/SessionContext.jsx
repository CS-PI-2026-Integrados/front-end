import React, { createContext, useContext, useEffect, useState } from 'react'
import { validateToken } from '@/lib/jwtUtils'

const SessionContext = createContext()

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('@sicape:token')
    localStorage.removeItem('@sicape:user')

    setSession(null)
  }

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('@sicape:token')
      const userStr = localStorage.getItem('@sicape:user')

      const decodedToken = validateToken(token)
      if (decodedToken && userStr) {
        try {
          const user = JSON.parse(userStr)
          setSession({
            user,
            tenant: { id: user.tenant, name: 'Comarca Sicape' },
          })
        } catch {
          handleLogout()
        }
      } else {
        handleLogout()
      }
      setIsLoading(false)
    }
    checkSession()
  }, [])

  return (
    <SessionContext.Provider value={{ session, setSession, handleLogout, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(SessionContext)
  return context
}
