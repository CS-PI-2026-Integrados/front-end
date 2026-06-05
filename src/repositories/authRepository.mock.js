import { mockTenants } from '@/mocks/tenants.mock'
import { mockUsers } from '@/mocks/users.mock'

const AUTH_TOKEN_STORAGE_KEY = '@sicape:token'
const TOKEN_SIGNATURE_SALT = 'sicape_mock_auth_v1'

const encodeTokenPart = (value) => {
  return btoa(JSON.stringify(value))
}

const decodeTokenPart = (value) => {
  return JSON.parse(atob(value))
}

const createSignature = (header, payload) => {
  return btoa(`${header}.${payload}.${TOKEN_SIGNATURE_SALT}`)
}

const buildUserResponse = (user) => {
  if (!user) {
    throw new Error('CPF ou senha incorretos.')
  }

  const tenantData = mockTenants.tenants.find((tenant) => tenant.id === user.tenantId)

  if (!tenantData) {
    throw new Error('Tenant não encontrado.')
  }

  const userData = { ...user }
  delete userData.password

  return { userData, tenantData }
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

export const findUserByCredentials = (cpf, password) => {
  const user = mockUsers.users.find((mockUser) => {
    return mockUser.cpf === cpf && mockUser.password === password
  })

  return buildUserResponse(user)
}

export const findUserByTokenPayload = (payload) => {
  const user = mockUsers.users.find((mockUser) => mockUser.id === payload.sub)

  return buildUserResponse(user)
}

export const createToken = (user) => {
  const header = encodeTokenPart({
    alg: 'HS256',
    typ: 'JWT',
  })

  const expiresAt = Date.now() + 1000 * 60 * 60
  const payload = encodeTokenPart({
    sub: user.id,
    tenantId: user.tenantId,
    name: user.name,
    exp: expiresAt,
    reset_token_expires_at: new Date(expiresAt).toISOString(),
  })
  const signature = createSignature(header, payload)

  return `${header}.${payload}.${signature}`
}

export const validateStoredToken = (token) => {
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

    if (!isValidPayload(decodedPayload)) {
      return null
    }

    return decodedPayload
  } catch {
    return null
  }
}

export const getStoredToken = () => {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export const saveStoredToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export const clearStoredToken = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}
