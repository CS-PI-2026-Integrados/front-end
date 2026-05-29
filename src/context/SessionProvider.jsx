import React, { useEffect, useState } from 'react'
import { validateToken } from '@/lib/jwtUtils'
import { SessionContext } from '@/context/sessionContext'

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleLogin = (user, token) => {
    localStorage.setItem('@sicape:token', token)
    localStorage.setItem('@sicape:user', JSON.stringify(user))

    setSession({
      user,
      tenant: {
        id: user.tenant,
        name: 'Comarca Sicape',
      },
    })
  }

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
          handleLogin(user, token)
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
    <SessionContext.Provider
      value={{
        session,
        setSession,
        handleLogin,
        handleLogout,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
