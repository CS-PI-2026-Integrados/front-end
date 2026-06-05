const TOKEN_SIGNATURE_SALT = 'sicape_mock_auth_v1'

const encode = (value) => {
  return btoa(JSON.stringify(value))
}

const decode = (value) => {
  return JSON.parse(atob(value))
}

const createSignature = (header, payload) => {
  return btoa(`${header}.${payload}.${TOKEN_SIGNATURE_SALT}`)
}

const isValidPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false
  if (!payload.sub || !payload.tenantId || !payload.name) return false
  if (typeof payload.exp !== 'number') return false
  if (payload.exp <= Date.now()) return false
  if (!payload.reset_token_expires_at) return false

  const resetTokenExpiresAt = new Date(payload.reset_token_expires_at).getTime()

  if (Number.isNaN(resetTokenExpiresAt) || resetTokenExpiresAt <= Date.now()) {
    return false
  }

  return true
}

export const generateToken = (user) => {
  const header = encode({
    alg: 'HS256',
    typ: 'JWT',
  })

  const expiresAt = Date.now() + 1000 * 60 * 60
  const payload = encode({
    sub: user.id,
    tenantId: user.tenantId,
    name: user.name,
    exp: expiresAt,
    reset_token_expires_at: new Date(expiresAt).toISOString(),
  })
  const signature = createSignature(header, payload)

  return `${header}.${payload}.${signature}`
}

export const validateToken = (token) => {
  if (!token || typeof token !== 'string') return null

  try {
    const [header, payload, signature] = token.split('.')

    if (!header || !payload || !signature || token.split('.').length !== 3) {
      return null
    }

    if (signature !== createSignature(header, payload)) {
      return null
    }

    const decodedHeader = decode(header)

    if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') {
      return null
    }

    const decodedPayload = decode(payload)

    if (!isValidPayload(decodedPayload)) {
      return null
    }

    return decodedPayload
  } catch {
    return null
  }
}
