import { getMockUsers, saveMockUsers } from '@/repositories/auth/authUserRepository.mock'

const PASSWORD_RESET_TOKEN_DURATION_MS = 30 * 60 * 1000

const createPasswordResetToken = () => {
  const randomValue = crypto.getRandomValues(new Uint32Array(2)).join('')

  return btoa(`${Date.now()}.${randomValue}`)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

const findUserWithValidPasswordResetToken = (users, token) => {
  if (!token || typeof token !== 'string') return null

  const user = users.find((mockUser) => mockUser.resetToken === token)

  if (!user?.resetTokenExpiresAt) return null

  const expiresAt = new Date(user.resetTokenExpiresAt).getTime()

  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) return null

  return user
}

export const createUserPasswordResetToken = async (cpf) => {
  const users = getMockUsers()
  const user = users.find((mockUser) => mockUser.cpf === cpf)

  if (!user) return null

  const token = createPasswordResetToken()
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_DURATION_MS).toISOString()
  const updatedUsers = users.map((mockUser) => {
    if (mockUser.id !== user.id) return mockUser

    return {
      ...mockUser,
      resetToken: token,
      resetTokenExpiresAt: expiresAt,
    }
  })

  saveMockUsers(updatedUsers)

  return {
    email: user.email,
    token,
    expiresAt,
  }
}

export const findUserByValidPasswordResetToken = async (token) => {
  return findUserWithValidPasswordResetToken(getMockUsers(), token)
}

export const updateUserPasswordByResetToken = async (token, password) => {
  const users = getMockUsers()
  const user = findUserWithValidPasswordResetToken(users, token)

  if (!user) {
    throw new Error('Este link nao e mais valido.')
  }

  const updatedUsers = users.map((mockUser) => {
    if (mockUser.id !== user.id) return mockUser

    return {
      ...mockUser,
      password,
      resetToken: null,
      resetTokenExpiresAt: null,
      mustChangePassword: false,
    }
  })

  saveMockUsers(updatedUsers)
}
