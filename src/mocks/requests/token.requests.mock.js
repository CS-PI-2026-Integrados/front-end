export const generateToken = (user) => {
  const header = btoa(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  )

  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      tenantId: user.tenant,
      name: user.name,
      exp: Date.now() + 1000 * 60 * 60,
    })
  )

  return `${header}.${payload}.mock_signature`
}

export const validateToken = (token) => {
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))

    console.log('TOKEN:', token)
    console.log('PAYLOAD:', payload)

    if (payload.exp < Date.now()) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
