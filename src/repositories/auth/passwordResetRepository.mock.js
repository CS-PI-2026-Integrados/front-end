import {
  findUserByCpf,
  findUserByResetToken,
  updateUserPassword,
  updateUserPasswordResetToken,
} from '@/repositories/users/usersRepository.mock'

const PASSWORD_RESET_TOKEN_DURATION_MS = 30 * 60 * 1000

const createPasswordResetToken = () => {
  const randomValue = crypto.getRandomValues(new Uint32Array(2)).join('')

  return btoa(`${Date.now()}.${randomValue}`)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

const findUserWithValidPasswordResetToken = async (token) => {
  if (!token || typeof token !== 'string') return null

  const user = await findUserByResetToken(token, { includeSensitive: true })

  if (!user?.resetTokenExpiresAt) return null

  const expiresAt = new Date(user.resetTokenExpiresAt).getTime()

  if (Number.isNaN(expiresAt) || expiresAt <= Date.now()) return null

  return user
}

export const createUserPasswordResetToken = async (cpf) => {
  const user = await findUserByCpf(cpf, { includeSensitive: true })

  if (!user) return null

  const token = createPasswordResetToken()
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_DURATION_MS).toISOString()
  await updateUserPasswordResetToken({
    userId: user.id,
    resetToken: token,
    resetTokenExpiresAt: expiresAt,
  })

  return {
    email: user.email,
    token,
    expiresAt,
  }
}

export const findUserByValidPasswordResetToken = async (token) => {
  return findUserWithValidPasswordResetToken(token)
}

export const updateUserPasswordByResetToken = async (token, password) => {
  const user = await findUserWithValidPasswordResetToken(token)

  if (!user) {
    throw new Error('Este link não é mais válido.')
  }

  await updateUserPassword({
    userId: user.id,
    password,
  })
}
