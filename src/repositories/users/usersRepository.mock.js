import { mockUsers } from '@/mocks/usuarios.mock'
import { findRoleById, findRoleByKey } from '@/repositories/roles/rolesRepository.mock'
import { ROLE_KEYS } from '@/lib/userPermissions'

const MOCK_USERS_STORAGE_KEY = '@sicape:mock-users'

export const removeSensitiveUserFields = (user) => {
  const publicUser = { ...user }

  delete publicUser.password
  delete publicUser.resetToken
  delete publicUser.resetTokenExpiresAt

  return publicUser
}

const enrichUserRole = async (user) => {
  if (!user) return null

  return {
    ...user,
    role: await findRoleById(user.roleId),
  }
}

const mapUserForReturn = async (user, { includeSensitive = false } = {}) => {
  const userWithRole = await enrichUserRole(user)

  if (!userWithRole) return null

  return includeSensitive ? userWithRole : removeSensitiveUserFields(userWithRole)
}

const parseStoredUsers = (storedUsers) => {
  if (!storedUsers) return mockUsers.users

  try {
    return JSON.parse(storedUsers)
  } catch {
    return mockUsers.users
  }
}

const getStoredUsers = () => {
  return parseStoredUsers(localStorage.getItem(MOCK_USERS_STORAGE_KEY))
}

const saveStoredUsers = (users) => {
  localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

export const subscribeToUsersChanges = (listener) => {
  if (typeof window === 'undefined' || typeof listener !== 'function') {
    return () => {}
  }

  const handleStorageChange = (event) => {
    if (event.key === MOCK_USERS_STORAGE_KEY) {
      listener({
        previousUsers: parseStoredUsers(event.oldValue),
        currentUsers: parseStoredUsers(event.newValue),
      })
    }
  }

  window.addEventListener('storage', handleStorageChange)

  return () => {
    window.removeEventListener('storage', handleStorageChange)
  }
}

export const listUsersByTenant = async (tenantId, options) => {
  const users = getStoredUsers().filter((user) => user.tenantId === tenantId)

  return Promise.all(users.map((user) => mapUserForReturn(user, options)))
}

export const findUserById = async (userId, options) => {
  const user = getStoredUsers().find((mockUser) => mockUser.id === userId)

  return mapUserForReturn(user, options)
}

export const findUserByCpf = async (cpf, options) => {
  const user = getStoredUsers().find((mockUser) => mockUser.cpf === cpf)

  return mapUserForReturn(user, options)
}

export const findUserByTenantAndCpf = async ({ tenantId, cpf }, options) => {
  const user = getStoredUsers().find((mockUser) => {
    return mockUser.tenantId === tenantId && mockUser.cpf === cpf
  })

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
    hasActiveSession: false,
    ...userData,
  }

  saveStoredUsers([...users, newUser])

  return mapUserForReturn(newUser)
}

export const updateUserActiveState = async ({ userId, isActive }) => {
  const users = getStoredUsers()
  const targetUser = users.find((user) => user.id === userId)

  if (!targetUser) {
    throw new Error('Usuário não encontrado.')
  }

  const updatedUsers = users.map((user) => {
    if (user.id !== userId) return user

    return {
      ...user,
      isActive,
      hasActiveSession: isActive === targetUser.isActive ? user.hasActiveSession : false,
    }
  })

  saveStoredUsers(updatedUsers)

  return mapUserForReturn(updatedUsers.find((user) => user.id === userId))
}

export const updateUserSessionState = async ({ userId, hasActiveSession, lastAccessAt }) => {
  const users = getStoredUsers()
  const targetUser = users.find((user) => user.id === userId)

  if (!targetUser) {
    throw new Error('Usuário não encontrado.')
  }

  const updatedUsers = users.map((user) => {
    if (user.id !== userId) return user

    return {
      ...user,
      hasActiveSession,
      lastAccessAt: lastAccessAt ?? user.lastAccessAt,
    }
  })

  saveStoredUsers(updatedUsers)

  return mapUserForReturn(updatedUsers.find((user) => user.id === userId))
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

  return mapUserForReturn(updatedUsers.find((user) => user.id === userId))
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

  return mapUserForReturn(updatedUsers.find((user) => user.id === userId))
}

export const getOperatorRoleId = async () => {
  const role = await findRoleByKey(ROLE_KEYS.OPERATOR)

  return role?.id
}
