import { mockUsers } from '@/mocks/users.mock'
import { mockTenants } from '@/mocks/tenants.mock'

const buildUserResponse = (user, tenantId) => {
  if (!user) {
    throw new Error('CPF ou senha incorretos.')
  }

  const tenantData = mockTenants.tenants.find((tenant) => tenant.id == tenantId)

  if (!tenantData) {
    throw new Error('Tenant não encontrado.')
  }
  // eslint-disable-next-line no-unused-vars
  const { password_, ...userData } = user

  return { userData, tenantData }
}

export const getUser = (cpf, password) => {
  const userFounded = mockUsers.users.find((u) => u.cpf === cpf && u.password === password)

  return buildUserResponse(userFounded, userFounded?.tenantId)
}

export const getUserByPayload = (payload) => {
  const userFounded = mockUsers.users.find((u) => u.id === payload.sub)

  return buildUserResponse(userFounded, userFounded?.tenantId)
}
