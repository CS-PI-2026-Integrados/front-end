import { apiService } from '@/shared/infrastructure/http/apiService'
import { clearSensitiveBrowserData } from '@/shared/infrastructure/storage/jsonStorage'

const createApiSession = () => {
  const payload = apiService.getAccessTokenPayload()
  if (!payload?.user?.id) return null

  return {
    user: {
      id: payload.user.id,
      name: payload.user.name,
      cpf: payload.user.cpf,
      tenantId: payload.judicialDistrict?.id || null,
      role: payload.user.role ? { key: payload.user.role } : null,
      mustChangePassword: false,
    },
    tenant: payload.judicialDistrict
      ? {
          id: payload.judicialDistrict.id,
          name: payload.judicialDistrict.name,
        }
      : null,
  }
}

export const login = async ({ cpf, password }) => {
  await apiService.login({ cpf, password })

  const session = createApiSession()
  if (!session) {
    apiService.clearTokens()
    throw new Error('Não foi possível identificar a sessão retornada pela API.')
  }

  return session
}

export const logout = () => {
  if (apiService.getTokens()) {
    void apiService.post('/authentication/logout').catch(() => {})
  }
  apiService.clearTokens()
  clearSensitiveBrowserData()
}

export const restoreSession = async () => {
  try {
    await apiService.getValidAccessToken()
    return createApiSession()
  } catch (error) {
    if (['network', 'timeout', 'backend'].includes(error.kind)) {
      // Retain claims for the UI during transient outages; the API still authorizes every call.
      const existingSession = createApiSession()
      if (existingSession) return existingSession
      throw error
    }
    // An older refresh may finish after a successful login in the same tab.
    if (apiService.isAccessTokenValid()) return createApiSession()
    logout()
    return null
  }
}

export const subscribeToAuthStateChanges = (listener) => {
  return apiService.subscribeToAuthChanges(listener)
}

export const requestPasswordReset = async () => {
  throw new Error('A recuperação por e-mail ainda não está disponível. Procure o administrador.')
}

export const validatePasswordResetToken = async () => false

export const definePasswordWithResetToken = async () => {
  throw new Error('Este link não é válido. Procure o administrador.')
}

export const definePasswordForRequiredChange = async () => {
  throw new Error('Altere a senha nas configurações informando a senha atual.')
}

export const changePassword = async (session, currentPassword, newPassword) => {
  if (!session?.user) {
    throw new Error('Sessão inválida.')
  }

  await apiService.post('/authentication/password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
  logout()
  return true
}
