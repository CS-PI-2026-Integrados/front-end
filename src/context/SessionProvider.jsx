import React, { useCallback, useEffect, useState } from 'react'
import { SessionContext } from '@/context/sessionContext'
import { logout, restoreSession } from '@/services/authService'

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const handleLogin = useCallback((authSession) => {
    setSession(authSession)
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setSession(null)
  }, [])

  const handleRestoreSession = useCallback(async () => {
    const restoredSession = await restoreSession()

    setSession(restoredSession)

    return restoredSession
  }, [])

  useEffect(() => {
    let shouldUpdateState = true

    const checkSession = async () => {
      const restoredSession = await restoreSession()

      if (!shouldUpdateState) return

      setSession(restoredSession)
      setIsLoading(false)
    }

    checkSession()

    return () => {
      shouldUpdateState = false
    }
  }, [])

  return (
    <SessionContext.Provider
      value={{
        session,
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
