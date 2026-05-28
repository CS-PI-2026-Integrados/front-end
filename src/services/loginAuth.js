import { generateMockJWT } from '@/lib/jwtUtils'
import { mockUsers } from '@/mocks/users.mock'

export const authenticateUser = async (cpf, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userFound = mockUsers.users.find(
        (user) => user.cpf === cpf && user.password === password
      )

      if (userFound) {
        // eslint-disable-next-line no-unused-vars
        const { password: _, ...userData } = userFound
        const fakeToken = generateMockJWT(userData, 60)

        resolve({
          user: userData,
          token: fakeToken,
        })
      } else {
        reject(new Error('CPF ou senha incorretos.'))
      }
    }, 1000)
  })
}
