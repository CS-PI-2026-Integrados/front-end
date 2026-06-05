import React, { useEffect, useState } from 'react'
import { SessionContext } from '@/context/sessionContext'
import { clearAuthSession, persistSessionToken, restoreAuthSession } from '@/services/authService'

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleLogin = (user, tenant, token) => {
    persistSessionToken(token)
    setSession({ user, tenant })
  }

  const handleLogout = () => {
    clearAuthSession()
    setSession(null)
  }

  useEffect(() => {
    const checkSession = () => {
      const restoredSession = restoreAuthSession()

      if (!restoredSession) {
        setSession(null)
        setIsLoading(false)
        return
      }

      setSession({
        user: restoredSession.user,
        tenant: restoredSession.tenant,
      })
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
