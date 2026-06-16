import {
  clearStoredToken,
  createToken,
  findUserByCredentials,
  findUserByTokenPayload,
  getStoredToken,
  saveStoredToken,
  validateStoredToken,
} from '@/repositories/authRepository.mock'

const buildSession = (userData, tenantData, token) => ({
  user: userData,
  tenant: tenantData,
  token,
})

export const authenticateUser = async (cpf, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const authenticatedUser = findUserByCredentials(cpf, password)
        const token = createToken(authenticatedUser.userData)

        resolve(buildSession(authenticatedUser.userData, authenticatedUser.tenantData, token))
      } catch (error) {
        reject(error)
      }
    }, 1000)
  })
}

export const persistSessionToken = (token) => {
  saveStoredToken(token)
}

export const clearAuthSession = () => {
  clearStoredToken()
}

export const readAuthSession = () => {
  const token = getStoredToken()
  const payload = validateStoredToken(token)

  if (!payload) {
    return null
  }

  try {
    const { userData, tenantData } = findUserByTokenPayload(payload)

    return buildSession(userData, tenantData, token)
  } catch {
    return null
  }
}

export const restoreAuthSession = () => {
  const authSession = readAuthSession()

  if (!authSession) {
    clearAuthSession()
  }

  return authSession
}
