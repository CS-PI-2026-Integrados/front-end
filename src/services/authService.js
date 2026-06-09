import {
  clearStoredToken,
  createSessionToken,
  createUserPasswordResetToken,
  findUserByCredentials,
  findUserById,
  findUserByValidPasswordResetToken,
  getStoredToken,
  saveStoredToken,
  updateUserPasswordByResetToken,
  validateSessionToken,
} from '@/repositories/authRepositoryFacade.js'
import { sendPasswordResetEmail } from '@/services/authEmailService.mock'

const buildSession = ({ user, tenant }) => ({
  user,
  tenant,
})

export const login = async ({ cpf, password }) => {
  const authUser = await findUserByCredentials(cpf, password)
  const token = createSessionToken(authUser.user)

  saveStoredToken(token)

  return buildSession(authUser)
}

export const logout = () => {
  clearStoredToken()
}

export const restoreSession = async () => {
  const token = getStoredToken()
  const payload = validateSessionToken(token)

  if (!payload) {
    logout()
    return null
  }

  try {
    const authUser = await findUserById(payload.sub)

    return buildSession(authUser)
  } catch {
    logout()
    return null
  }
}

export const requestPasswordReset = async (cpf) => {
  const resetRequest = await createUserPasswordResetToken(cpf)

  if (!resetRequest) return

  await sendPasswordResetEmail(resetRequest.email, resetRequest.token)
}

export const validatePasswordResetToken = async (token) => {
  const user = await findUserByValidPasswordResetToken(token)

  return Boolean(user)
}

export const resetPassword = async (token, password) => {
  await updateUserPasswordByResetToken(token, password)
}
