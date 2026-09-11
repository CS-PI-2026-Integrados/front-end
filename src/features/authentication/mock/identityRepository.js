import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { mockUsers } from './identityInitialUsers'

const IDENTITY_STORAGE_KEY = '@sicape:mock-users'

function readIdentities() {
  return readJson(IDENTITY_STORAGE_KEY, mockUsers.users)
}

function writeIdentities(identities) {
  writeJson(IDENTITY_STORAGE_KEY, identities)
}

function withoutSensitiveFields(identity) {
  const user = { ...identity }

  delete user.password
  delete user.resetToken
  delete user.resetTokenExpiresAt

  return user
}

export async function findIdentityByCpf(cpf, { includeSensitive = false } = {}) {
  const identity = readIdentities().find((user) => user.cpf === cpf)
  if (!identity) return null

  return includeSensitive ? { ...identity } : withoutSensitiveFields(identity)
}

export async function findIdentityById(id, { includeSensitive = false } = {}) {
  const identity = readIdentities().find((user) => user.id === id)
  if (!identity) return null

  return includeSensitive ? { ...identity } : withoutSensitiveFields(identity)
}

export async function findIdentityByResetToken(token, { includeSensitive = false } = {}) {
  const identity = readIdentities().find((user) => user.resetToken === token)
  if (!identity) return null

  return includeSensitive ? { ...identity } : withoutSensitiveFields(identity)
}

export async function updateIdentityPassword({ userId, password, mustChangePassword = false }) {
  const identities = readIdentities()
  const currentIdentity = identities.find((user) => user.id === userId)

  if (!currentIdentity) {
    throw new Error('Usuário não encontrado.')
  }

  const nextIdentities = identities.map((identity) =>
    identity.id === userId
      ? {
          ...identity,
          password,
          resetToken: null,
          resetTokenExpiresAt: null,
          mustChangePassword,
        }
      : identity
  )

  writeIdentities(nextIdentities)
  return withoutSensitiveFields(nextIdentities.find((identity) => identity.id === userId))
}

export async function updateIdentityPasswordResetToken({
  userId,
  resetToken,
  resetTokenExpiresAt,
}) {
  const identities = readIdentities()
  const currentIdentity = identities.find((user) => user.id === userId)

  if (!currentIdentity) {
    throw new Error('Usuário não encontrado.')
  }

  const nextIdentities = identities.map((identity) =>
    identity.id === userId ? { ...identity, resetToken, resetTokenExpiresAt } : identity
  )

  writeIdentities(nextIdentities)
  return withoutSensitiveFields(nextIdentities.find((identity) => identity.id === userId))
}
