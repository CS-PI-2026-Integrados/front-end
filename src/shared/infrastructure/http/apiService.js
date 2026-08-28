import toast from 'react-hot-toast'

const DEFAULT_API_BASE_URL = '/api'
const TOKEN_STORAGE_KEY = '@sicape:api-tokens'
const ACCESS_TOKEN_REFRESH_SKEW_MS = 30_000

export class ApiRequestError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')

const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null

  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    )

    return JSON.parse(atob(paddedPayload))
  } catch {
    return null
  }
}

const encodeBasicCredentials = (cpf, password) => {
  const credentials = new TextEncoder().encode(`${cpf}:${password}`)
  return btoa(String.fromCharCode(...credentials))
}

const parseResponseBody = async (response) => {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (
    contentType.includes('application/json') ||
    contentType.includes('application/problem+json')
  ) {
    return response.json()
  }

  return response.text()
}

const getErrorMessage = (body) => {
  if (body && typeof body === 'object') {
    return body.message || 'Não foi possível concluir a requisição.'
  }

  return 'Não foi possível concluir a requisição.'
}

export class ApiService {
  #refreshPromise = null

  getTokens() {
    const serializedTokens = sessionStorage.getItem(TOKEN_STORAGE_KEY)
    if (!serializedTokens) return null

    try {
      const tokens = JSON.parse(serializedTokens)
      if (!tokens?.accessToken || !tokens?.refreshToken) return null

      return tokens
    } catch {
      this.clearTokens()
      return null
    }
  }

  saveTokens(tokens) {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens))
  }

  clearTokens() {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  }

  getAccessTokenPayload() {
    return decodeJwtPayload(this.getTokens()?.accessToken)
  }

  isAccessTokenValid(accessToken = this.getTokens()?.accessToken) {
    const payload = decodeJwtPayload(accessToken)
    return (
      typeof payload?.exp === 'number' &&
      payload.exp * 1000 > Date.now() + ACCESS_TOKEN_REFRESH_SKEW_MS
    )
  }

  async login({ cpf, password }) {
    const response = await this.#request('/authentication/login', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encodeBasicCredentials(cpf, password)}`,
      },
    })

    const tokens = {
      accessToken: response.access_token,
      refreshToken: response.refresh_token,
      expiresIn: response.expires_in,
      tokenType: response.token_type,
    }

    if (!tokens.accessToken || !tokens.refreshToken) {
      throw new ApiRequestError('A API não retornou os tokens de autenticação esperados.')
    }

    this.saveTokens(tokens)
    return tokens
  }

  async getValidAccessToken() {
    const tokens = this.getTokens()
    if (!tokens) {
      throw new ApiRequestError('Não há uma sessão autenticada.', { status: 401 })
    }

    if (this.isAccessTokenValid(tokens.accessToken)) return tokens.accessToken

    return this.#refreshAccessToken(tokens.refreshToken)
  }

  get(path, options) {
    return this.request(path, { ...options, method: 'GET' })
  }

  post(path, body, options) {
    return this.request(path, { ...options, method: 'POST', body })
  }

  put(path, body, options) {
    return this.request(path, { ...options, method: 'PUT', body })
  }

  delete(path, options) {
    return this.request(path, { ...options, method: 'DELETE' })
  }

  async request(path, { headers, body, signal, method = 'GET' } = {}) {
    const accessToken = await this.getValidAccessToken()

    return this.#request(path, {
      method,
      signal,
      body,
      headers: {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  async #refreshAccessToken(refreshToken) {
    if (!this.#refreshPromise) {
      this.#refreshPromise = this.#refresh(refreshToken).finally(() => {
        this.#refreshPromise = null
      })
    }

    return this.#refreshPromise
  }

  async #refresh(refreshToken) {
    try {
      const response = await this.#request('/authentication/refresh', {
        method: 'POST',
        body: new URLSearchParams({ refresh_token: refreshToken }),
      })

      if (!response.access_token) {
        throw new ApiRequestError('A API não retornou um novo access token.')
      }

      const tokens = this.getTokens()
      if (!tokens) {
        throw new ApiRequestError('A sessão foi encerrada durante a renovação.', { status: 401 })
      }

      this.saveTokens({
        ...tokens,
        accessToken: response.access_token,
        expiresIn: response.expires_in,
      })

      return response.access_token
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  async #request(path, { headers = {}, body, ...options } = {}) {
    const requestHeaders = new Headers(headers)
    let requestBody = body

    if (
      body &&
      typeof body === 'object' &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams)
    ) {
      requestHeaders.set('Content-Type', 'application/json')
      requestBody = JSON.stringify(body)
    }

    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      body: requestBody,
      headers: requestHeaders,
    })
    const responseBody = await parseResponseBody(response)

    if (!response.ok) {
      const message = getErrorMessage(responseBody)
      toast.error(message)
      throw new ApiRequestError(message, {
        status: response.status,
        body: responseBody,
      })
    }

    return responseBody
  }
}

export const apiService = new ApiService()
