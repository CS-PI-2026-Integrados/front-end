import React, { useEffect, useState } from 'react'
import { SessionContext } from '@/context/sessionContext'
import { validateToken } from '@/mocks/requests/token.requests.mock'
import { getUserByPayload } from '@/mocks/requests/users.requests.mock'

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleLogin = (user, tenant, token) => {
    localStorage.setItem('@sicape:token', token)
    setSession({ user, tenant })
  }

  const handleLogout = () => {
    localStorage.removeItem('@sicape:token')
    setSession(null)
  }

  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem('@sicape:token')
      const payload = validateToken(token)

      if (!payload) {
        handleLogout()
        setIsLoading(false)
        return
      }

      try {
        const { userData, tenantData } = getUserByPayload(payload)
        handleLogin(userData, tenantData, token)
      } catch {
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
