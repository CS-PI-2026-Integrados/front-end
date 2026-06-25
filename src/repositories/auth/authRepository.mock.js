import { mockTenants } from '@/mocks/tenants.mock'
import {
  findUserByCpf,
  findUserById,
  removeSensitiveUserFields,
} from '@/repositories/users/usersRepository.mock'

const buildAuthUserResponse = (user, fallbackMessage) => {
  if (!user) {
    throw new Error(fallbackMessage)
  }

  const tenant = mockTenants.tenants.find((mockTenant) => mockTenant.id === user.tenantId)

  if (!tenant) {
    throw new Error('Tenant não encontrado.')
  }

  return {
    user,
    tenant,
  }
}

export const findAuthUserByCredentials = async (cpf, password) => {
  const privateUser = await findUserByCpf(cpf, { includeSensitive: true })

  if (!privateUser || privateUser.password !== password) {
    throw new Error('CPF ou senha incorretos.')
  }

  return buildAuthUserResponse(removeSensitiveUserFields(privateUser), 'CPF ou senha incorretos.')
}

export const findAuthUserById = async (id) => {
  const user = await findUserById(id)

  return buildAuthUserResponse(user, 'Usuário não encontrado.')
}
