import mock_users from '@/mocks/mock-users.json'

export const authenticateUser = async (cpf, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const userFound = mock_users.find((user) => user.cpf === cpf && user.password === password)

      if (userFound) {
        const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockToken_' + Date.now()
        // eslint-disable-next-line no-unused-vars
        const { password: _, tenant: originalTenant, ...userData } = userFound

        const formattedTenant = originalTenant
          .toLowerCase()
          .replace(/\s+/g, '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

        resolve({
          user: userData,
          tenant: formattedTenant,
          token: fakeToken,
        })
      } else {
        reject(new Error('CPF ou senha incorretos.'))
      }
    }, 1000)
  })
}
