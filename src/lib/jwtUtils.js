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
export const validateToken = (token) => {
  if (!token) return false

  try {
    const parts = token.split('.')
    console.log('TOKEN:', token)
    console.log('PARTS:', parts)
    console.log('PAYLOAD BASE64:', parts[1])
    console.log('PAYLOAD JSON:', atob(parts[1]))

    if (parts.length !== 3) return false

    const payload = JSON.parse(atob(parts[1]))

    const currentTime = Math.floor(Date.now() / 1000)

    if (payload.exp < currentTime) return false

    return payload
  } catch (error) {
    return false
  }
}
