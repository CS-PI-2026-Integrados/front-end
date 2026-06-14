import {
  clearStoredToken,
  getStoredToken,
  saveStoredToken,
} from '@/repositories/auth/authSessionStorage.mock'
import {
  createSessionToken,
  validateSessionToken,
} from '@/repositories/auth/authTokenRepository.mock'
import {
  findAuthUserByCredentials,
  findAuthUserById,
} from '@/repositories/auth/authRepository.mock'
import { updateUserSessionState } from '@/repositories/users/usersRepository.mock'
import {
  createUserPasswordResetToken,
  findUserByValidPasswordResetToken,
  updateUserPasswordByResetToken,
} from '@/repositories/auth/passwordResetRepository.mock'
import { sendPasswordResetEmail } from '@/services/authEmailService.mock'

const buildSession = ({ user, tenant }) => ({
  user,
  tenant,
})

const ensureActiveUser = (user) => {
  if (!user.isActive) {
    throw new Error('Usuário sem acesso ativo.')
  }
}

export const login = async ({ cpf, password }) => {
  const authUser = await findAuthUserByCredentials(cpf, password)

  ensureActiveUser(authUser.user)

  const sessionUser = await updateUserSessionState({
    userId: authUser.user.id,
    hasActiveSession: true,
    lastAccessAt: new Date().toISOString(),
  })

  const token = createSessionToken(sessionUser)

  saveStoredToken(token)

  return buildSession({
    ...authUser,
    user: sessionUser,
  })
}

export const logout = () => {
  const token = getStoredToken()
  const payload = validateSessionToken(token)

  if (payload?.sub) {
    void updateUserSessionState({
      userId: payload.sub,
      hasActiveSession: false,
    }).catch(() => {})
  }

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
    const authUser = await findAuthUserById(payload.sub)

    ensureActiveUser(authUser.user)

    const sessionUser = await updateUserSessionState({
      userId: authUser.user.id,
      hasActiveSession: true,
    })

    return buildSession({
      ...authUser,
      user: sessionUser,
    })
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
