import React, { useCallback, useEffect, useState } from 'react'
import { SessionContext } from '@/context/sessionContext'
import { logout, restoreSession, subscribeToAuthStateChanges } from '@/services/authService'

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
    let validationId = 0

    const checkSession = async ({ showLoader = false } = {}) => {
      const currentValidationId = ++validationId

      if (showLoader) {
        setIsLoading(true)
      }

      const restoredSession = await restoreSession()

      if (!shouldUpdateState || currentValidationId !== validationId) return

      setSession(restoredSession)
      setIsLoading(false)
    }

    const revalidateSession = () => {
      void checkSession({ showLoader: false })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        revalidateSession()
      }
    }

    void checkSession({ showLoader: true })

    const unsubscribeFromAuthStateChanges = subscribeToAuthStateChanges(revalidateSession)

    window.addEventListener('focus', revalidateSession)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      shouldUpdateState = false
      validationId += 1
      unsubscribeFromAuthStateChanges()
      window.removeEventListener('focus', revalidateSession)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
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
