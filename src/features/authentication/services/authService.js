import { apiService } from '@/shared/infrastructure/http/apiService'
import { findAuthUserByCredentials } from '@/features/authentication/mock/authMock'
import { updateUserPassword } from '@/features/users/mock/usersMock'
import {
  createUserPasswordResetToken,
  findUserByValidPasswordResetToken,
} from '@/features/authentication/mock/passwordResetMock'
import { sendPasswordResetEmail } from '@/features/authentication/mock/authEmailMock'

const createApiSession = () => {
  const payload = apiService.getAccessTokenPayload()
  if (!payload?.user?.id) return null

  return {
    user: {
      id: payload.user.id,
      name: payload.user.name,
      cpf: payload.user.cpf,
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

const applyDefinedPassword = async ({ userId, password }) => {
  return updateUserPassword({
    userId,
    password,
    mustChangePassword: false,
  })
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
  apiService.clearTokens()
}

export const restoreSession = async () => {
  try {
    await apiService.getValidAccessToken()
    return createApiSession()
  } catch {
    logout()
    return null
  }
}

export const subscribeToAuthStateChanges = (listener) => {
  void listener
  return () => {}
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

export const definePasswordWithResetToken = async (token, password) => {
  const user = await findUserByValidPasswordResetToken(token)

  if (!user) {
    throw new Error('Este link não é mais válido.')
  }

  return applyDefinedPassword({
    userId: user.id,
    password,
  })
}

export const definePasswordForRequiredChange = async (session, password) => {
  if (!session?.user?.mustChangePassword) {
    throw new Error('A troca obrigatória de senha não está pendente.')
  }

  return applyDefinedPassword({
    userId: session.user.id,
    password,
  })
}

export const changePassword = async (session, currentPassword, newPassword) => {
  if (!session?.user) {
    throw new Error('Sessão inválida.')
  }

  await findAuthUserByCredentials(session.user.cpf, currentPassword)

  const updated = await updateUserPassword({
    userId: session.user.id,
    password: newPassword,
    mustChangePassword: false,
  })

  return updated
}
