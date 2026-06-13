import { mockUsers } from '@/mocks/users.mock'
import { SESSION_STATUS } from '@/lib/roles'

const MOCK_USERS_STORAGE_KEY = '@sicape:mock-users'

export const removeSensitiveUserFields = (user) => {
  const publicUser = { ...user }

  delete publicUser.password
  delete publicUser.resetToken
  delete publicUser.resetTokenExpiresAt

  return publicUser
}

const mapUserForReturn = (user, { includeSensitive = false } = {}) => {
  if (!user) return null

  return includeSensitive ? { ...user } : removeSensitiveUserFields(user)
}

const getStoredUsers = () => {
  const storedUsers = localStorage.getItem(MOCK_USERS_STORAGE_KEY)

  if (!storedUsers) return mockUsers.users

  try {
    return JSON.parse(storedUsers)
  } catch {
    return mockUsers.users
  }
}

const saveStoredUsers = (users) => {
  localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

export const listUsersByTenant = async (tenantId, options) => {
  return getStoredUsers()
    .filter((user) => user.tenantId === tenantId)
    .map((user) => mapUserForReturn(user, options))
}

export const findUserById = async (userId, options) => {
  const user = getStoredUsers().find((mockUser) => mockUser.id === userId)

  return mapUserForReturn(user, options)
}

export const findUserByCpf = async (cpf, options) => {
  const user = getStoredUsers().find((mockUser) => mockUser.cpf === cpf)

  return mapUserForReturn(user, options)
}

export const findUserByEmail = async (email, options) => {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase()
  const user = getStoredUsers().find((mockUser) => mockUser.email.toLowerCase() === normalizedEmail)

  return mapUserForReturn(user, options)
}

export const findUserByResetToken = async (token, options) => {
  const user = getStoredUsers().find((mockUser) => mockUser.resetToken === token)

  return mapUserForReturn(user, options)
}

export const createUser = async (userData) => {
  const users = getStoredUsers()
  const newUser = {
    id: crypto.randomUUID(),
    resetToken: null,
    resetTokenExpiresAt: null,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
    lastAccessAt: null,
    sessionStatus: SESSION_STATUS.INACTIVE,
    ...userData,
  }

  saveStoredUsers([...users, newUser])

  return removeSensitiveUserFields(newUser)
}

export const updateUserStatus = async ({ userId, status }) => {
  const users = getStoredUsers()
  const targetUser = users.find((user) => user.id === userId)

  if (!targetUser) {
    throw new Error('Usuário não encontrado.')
  }

  const updatedUsers = users.map((user) => {
    if (user.id !== userId) return user

    return {
      ...user,
      status,
      sessionStatus: status === targetUser.status ? user.sessionStatus : SESSION_STATUS.INACTIVE,
    }
  })

  saveStoredUsers(updatedUsers)

  return removeSensitiveUserFields(updatedUsers.find((user) => user.id === userId))
}

export const updateUserPasswordResetToken = async ({ userId, resetToken, resetTokenExpiresAt }) => {
  const users = getStoredUsers()
  const targetUser = users.find((user) => user.id === userId)

  if (!targetUser) {
    throw new Error('Usuário não encontrado.')
  }

  const updatedUsers = users.map((user) => {
    if (user.id !== userId) return user

    return {
      ...user,
      resetToken,
      resetTokenExpiresAt,
    }
  })

  saveStoredUsers(updatedUsers)

  return removeSensitiveUserFields(updatedUsers.find((user) => user.id === userId))
}

export const updateUserPassword = async ({ userId, password }) => {
  const users = getStoredUsers()
  const targetUser = users.find((user) => user.id === userId)

  if (!targetUser) {
    throw new Error('Usuário não encontrado.')
  }

  const updatedUsers = users.map((user) => {
    if (user.id !== userId) return user

    return {
      ...user,
      password,
      resetToken: null,
      resetTokenExpiresAt: null,
      mustChangePassword: false,
    }
  })

  saveStoredUsers(updatedUsers)

  return removeSensitiveUserFields(updatedUsers.find((user) => user.id === userId))
}
