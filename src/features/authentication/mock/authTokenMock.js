const SESSION_TOKEN_SECRET = 'sicape_mock_auth_v1'
const SESSION_TOKEN_DURATION_MS = 1000 * 60 * 60

const encodeTokenPart = (value) => {
  return btoa(JSON.stringify(value))
}

const decodeTokenPart = (value) => {
  return JSON.parse(atob(value))
}

const createSignature = (header, payload) => {
  return btoa(`${header}.${payload}.${SESSION_TOKEN_SECRET}`)
}

const isValidSessionPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return false
  if (!payload.sub || !payload.tenantId || !payload.name) return false
  if (typeof payload.exp !== 'number') return false

  return payload.exp > Date.now()
}

export const createSessionToken = (user) => {
  const header = encodeTokenPart({
    alg: 'HS256',
    typ: 'JWT',
  })

  const payload = encodeTokenPart({
    sub: user.id,
    tenantId: user.tenantId,
    name: user.name,
    exp: Date.now() + SESSION_TOKEN_DURATION_MS,
  })
  const signature = createSignature(header, payload)

  return `${header}.${payload}.${signature}`
}

export const validateSessionToken = (token) => {
  if (!token || typeof token !== 'string') return null

  try {
    const tokenParts = token.split('.')
    const [header, payload, signature] = tokenParts

    if (!header || !payload || !signature || tokenParts.length !== 3) {
      return null
    }

    if (signature !== createSignature(header, payload)) {
      return null
    }

    const decodedHeader = decodeTokenPart(header)

    if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT') {
      return null
    }

    const decodedPayload = decodeTokenPart(payload)

    if (!isValidSessionPayload(decodedPayload)) {
      return null
    }

    return decodedPayload
  } catch {
    return null
  }
}
