import { generateToken } from '@/mocks/requests/token.requests.mock'
import { getUser } from '@/mocks/requests/users.requests.mock'

export const authenticateUser = async (cpf, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const authenticatedUser = getUser(cpf, password)

        const fakeToken = generateToken(authenticatedUser.userData)

        resolve({
          user: authenticatedUser.userData,
          tenant: authenticatedUser.tenantData,
          token: fakeToken,
        })
      } catch (error) {
        reject(error)
      }
    }, 1000)
  })
}
