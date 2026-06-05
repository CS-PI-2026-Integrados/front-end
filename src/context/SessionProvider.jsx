import React, { useCallback, useEffect, useState } from 'react'
import { SessionContext } from '@/context/sessionContext'
import { clearAuthSession, persistSessionToken, restoreAuthSession } from '@/services/authService'

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const applySession = useCallback((authSession) => {
    const nextSession = {
      user: authSession.user,
      tenant: authSession.tenant,
    }

    setSession(nextSession)

    return nextSession
  }, [])

  const handleLogin = useCallback((user, tenant, token) => {
    persistSessionToken(token)
    setSession({ user, tenant })
  }, [])

  const handleLogout = useCallback(() => {
    clearAuthSession()
    setSession(null)
  }, [])

  const handleRestoreSession = useCallback(() => {
    const restoredSession = restoreAuthSession()

    if (!restoredSession) {
      setSession(null)
      return null
    }

    return applySession(restoredSession)
  }, [applySession])

  useEffect(() => {
    const checkSession = () => {
      handleRestoreSession()
      setIsLoading(false)
    }
    checkSession()
  }, [handleRestoreSession])

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        handleLogin,
        handleLogout,
        handleRestoreSession,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}
