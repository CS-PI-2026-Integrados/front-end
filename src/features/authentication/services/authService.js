import {
  clearStoredToken,
  getStoredToken,
  saveStoredToken,
} from '@/features/authentication/mock/authSessionMock'
import {
  createSessionToken,
  validateSessionToken,
} from '@/features/authentication/mock/authTokenMock'
import {
  findAuthUserByCredentials,
  findAuthUserById,
} from '@/features/authentication/mock/authMock'
import {
  subscribeToUsersChanges,
  updateUserPassword,
  updateUserLastAccessAt,
} from '@/features/users/mock/usersMock'
import {
  createUserPasswordResetToken,
  findUserByValidPasswordResetToken,
} from '@/features/authentication/mock/passwordResetMock'
import { sendPasswordResetEmail } from '@/features/authentication/mock/authEmailMock'

const buildSession = ({ user, tenant }) => ({
  user,
  tenant,
})

const AUTH_RELEVANT_USER_FIELDS = ['isActive', 'roleId', 'tenantId', 'mustChangePassword']

const hasUserAccessChanged = (previousUser, currentUser) => {
  if (!previousUser || !currentUser) {
    return previousUser !== currentUser
  }

  return AUTH_RELEVANT_USER_FIELDS.some((field) => previousUser[field] !== currentUser[field])
}

const ensureActiveUser = (user) => {
  if (!user.isActive) {
    throw new Error('Usuário sem acesso ativo.')
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
  const authUser = await findAuthUserByCredentials(cpf, password)

  ensureActiveUser(authUser.user)

  const sessionUser = await updateUserLastAccessAt({
    userId: authUser.user.id,
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

    return buildSession(authUser)
  } catch {
    logout()
    return null
  }
}

export const subscribeToAuthStateChanges = (listener) => {
  return subscribeToUsersChanges(({ previousUsers, currentUsers }) => {
    const payload = validateSessionToken(getStoredToken())

    if (!payload?.sub) return

    const previousUser = previousUsers.find((user) => user.id === payload.sub)
    const currentUser = currentUsers.find((user) => user.id === payload.sub)

    if (hasUserAccessChanged(previousUser, currentUser)) {
      listener()
    }
  })
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
