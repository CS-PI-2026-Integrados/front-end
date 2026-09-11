import { findIdentityByCpf, findIdentityById } from './identityRepository'

const buildAuthUserResponse = (user, fallbackMessage) => {
  if (!user) {
    throw new Error(fallbackMessage)
  }

  return {
    user,
  }
}

export const findAuthUserByCredentials = async (cpf, password) => {
  const privateUser = await findIdentityByCpf(cpf, { includeSensitive: true })

  if (!privateUser || privateUser.password !== password) {
    throw new Error('CPF ou senha incorretos.')
  }

  return buildAuthUserResponse(
    {
      ...privateUser,
      password: undefined,
      resetToken: undefined,
      resetTokenExpiresAt: undefined,
    },
    'CPF ou senha incorretos.'
  )
}

export const findAuthUserById = async (id) => {
  const user = await findIdentityById(id)

  return buildAuthUserResponse(user, 'Usuário não encontrado.')
}
