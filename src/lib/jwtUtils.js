export const generateMockJWT = (userData, expireInMinutes = 60) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      ...userData,
      exp: Math.floor(Date.now() / 1000) + expireInMinutes * 60,
    })
  )
  const signature = 'mock_signature_to_simulate_valid_jwt'

  return `${header}.${payload}.${signature}`
}
