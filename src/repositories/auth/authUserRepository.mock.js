import { mockTenants } from '@/mocks/tenants.mock'
import { mockUsers } from '@/mocks/users.mock'

const MOCK_USERS_STORAGE_KEY = '@sicape:mock-users'

const sanitizeUser = (user) => {
  const publicUser = { ...user }

  delete publicUser.password
  delete publicUser.resetToken
  delete publicUser.resetTokenExpiresAt

  return publicUser
}

export const getMockUsers = () => {
  const storedUsers = localStorage.getItem(MOCK_USERS_STORAGE_KEY)

  if (!storedUsers) return mockUsers.users

  try {
    return JSON.parse(storedUsers)
  } catch {
    return mockUsers.users
  }
}

export const saveMockUsers = (users) => {
  localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

const buildAuthUserResponse = (user, fallbackMessage) => {
  if (!user) {
    throw new Error(fallbackMessage)
  }

  const tenant = mockTenants.tenants.find((mockTenant) => mockTenant.id === user.tenantId)

  if (!tenant) {
    throw new Error('Tenant nao encontrado.')
  }

  return {
    user: sanitizeUser(user),
    tenant,
  }
}

export const findUserByCredentials = async (cpf, password) => {
  const user = getMockUsers().find((mockUser) => {
    return mockUser.cpf === cpf && mockUser.password === password
  })

  return buildAuthUserResponse(user, 'CPF ou senha incorretos.')
}

export const findUserById = async (id) => {
  const user = getMockUsers().find((mockUser) => mockUser.id === id)

  return buildAuthUserResponse(user, 'Usuario nao encontrado.')
}
