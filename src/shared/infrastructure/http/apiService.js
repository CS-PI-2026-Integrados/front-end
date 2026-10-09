const DEFAULT_API_BASE_URL = '/api'
const TOKEN_STORAGE_KEY = '@sicape:api-tokens'
const ACCESS_TOKEN_REFRESH_SKEW_MS = 30_000

const abortError = () => new DOMException('Operação cancelada.', 'AbortError')
const throwIfCancelled = (signal) => {
  if (signal?.aborted) throw abortError()
}
// A cancelled consumer must not cancel a refresh shared by other consumers.
async function waitForToken(promise, signal) {
  if (!signal) return promise
  throwIfCancelled(signal)
  let abort
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        abort = () => reject(abortError())
        signal.addEventListener('abort', abort, { once: true })
      }),
    ])
  } finally {
    signal.removeEventListener('abort', abort)
  }
}

export class ApiRequestError extends Error {
  constructor(message, { status = null, body = null, kind = 'backend', fields = [], cause } = {}) {
    super(message, { cause })
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
    this.kind = kind
    this.fields = fields
  }
}

const getApiBaseUrl = () =>
  (import.meta.env?.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '')

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

const parseResponseBody = async (response, responseType) => {
  if (response.status === 204 || response.status === 205) return null
  if (response.ok && responseType === 'blob') return response.blob()
  const text = await response.text()
  if (!text) return null
  const contentType = response.headers.get('content-type') || ''
  if (
    contentType.includes('application/json') ||
    contentType.includes('application/problem+json')
  ) {
    return JSON.parse(text)
  }

  return text
}

const getErrorMessage = (body) => {
  if (body && typeof body === 'object') {
    return body.message || 'Não foi possível concluir a requisição.'
  }

  return 'Não foi possível concluir a requisição.'
}

export class ApiService {
  #refreshPromise = null
  #listeners = new Set()

  subscribeToAuthChanges(listener) {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

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
    const hadTokens = Boolean(sessionStorage.getItem(TOKEN_STORAGE_KEY))
    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    if (hadTokens) this.#listeners.forEach((listener) => listener())
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
      accessToken: response?.access_token,
      refreshToken: response?.refresh_token,
      expiresIn: response?.expires_in,
      tokenType: response?.token_type,
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
      throw new ApiRequestError('Não há uma sessão autenticada.', { status: 401, kind: 'auth' })
    }

    if (this.isAccessTokenValid(tokens.accessToken)) return tokens.accessToken

    return this.#refreshAccessToken(tokens.refreshToken)
  }

  get(path, options) {
    return this.request(path, { ...options, method: 'GET' })
  }

  getBlob(path, options) {
    return this.request(path, { ...options, responseType: 'blob' })
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

  async request(path, { headers, body, signal, method = 'GET', ...options } = {}) {
    throwIfCancelled(signal)
    const accessToken = await waitForToken(this.getValidAccessToken(), signal)
    throwIfCancelled(signal)
    try {
      return await this.#request(path, {
        ...options,
        method,
        signal,
        body,
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
      })
    } catch (error) {
      if (error.status === 401 && this.getTokens()?.accessToken === accessToken) this.clearTokens()
      throw error
    }
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

      if (!response?.access_token) {
        throw new ApiRequestError('A API não retornou um novo access token.')
      }

      const tokens = this.getTokens()
      if (!tokens || tokens.refreshToken !== refreshToken) {
        throw new ApiRequestError('A sessão foi encerrada durante a renovação.', { status: 401 })
      }

      this.saveTokens({
        ...tokens,
        accessToken: response.access_token,
        expiresIn: response.expires_in,
      })

      return response.access_token
    } catch (error) {
      if ([400, 401, 403].includes(error.status) && this.getTokens()?.refreshToken === refreshToken)
        this.clearTokens()
      throw error
    }
  }

  async #request(
    path,
    { headers = {}, body, signal, timeoutMs = 30_000, responseType, ...options } = {}
  ) {
    const requestHeaders = new Headers(headers)
    let requestBody = body

    if (body instanceof FormData) requestHeaders.delete('Content-Type')
    if (body instanceof URLSearchParams)
      requestHeaders.set('Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8')
    if (!requestHeaders.has('Accept'))
      requestHeaders.set('Accept', responseType === 'blob' ? '*/*' : 'application/json')

    if (
      body &&
      typeof body === 'object' &&
      !(body instanceof FormData) &&
      !(body instanceof URLSearchParams)
    ) {
      requestHeaders.set('Content-Type', 'application/json')
      requestBody = JSON.stringify(body)
    }

    const controller = new AbortController()
    let timedOut = false
    const abort = () => controller.abort(signal.reason)
    throwIfCancelled(signal)
    signal?.addEventListener('abort', abort, { once: true })
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeoutMs)
    try {
      const response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...options,
        body: requestBody,
        headers: requestHeaders,
        signal: controller.signal,
      })
      let responseBody
      try {
        responseBody = await parseResponseBody(response, responseType)
      } catch (cause) {
        if (controller.signal.aborted) throw cause
        throw new ApiRequestError('A API retornou uma resposta inválida.', {
          status: response.status,
          cause,
        })
      }

      if (!response.ok) {
        const message = getErrorMessage(responseBody)
        throw new ApiRequestError(message, {
          status: response.status,
          body: responseBody,
          fields: Array.isArray(responseBody?.fields)
            ? responseBody.fields.map((item) => ({
                field: String(item.field || '').replace(/_([a-z])/g, (_, letter) =>
                  letter.toUpperCase()
                ),
                message: item.message,
              }))
            : [],
          kind: [401, 403].includes(response.status)
            ? 'auth'
            : [400, 413, 422].includes(response.status)
              ? 'validation'
              : 'backend',
        })
      }

      return responseBody
    } catch (cause) {
      if (signal?.aborted) throw abortError()
      if (timedOut)
        throw new ApiRequestError('A requisição excedeu o tempo limite. Tente novamente.', {
          kind: 'timeout',
          cause,
        })
      if (cause instanceof ApiRequestError) throw cause
      throw new ApiRequestError(
        'Não foi possível conectar à API. Verifique sua conexão e tente novamente.',
        { kind: 'network', cause }
      )
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
    }
  }
}

export const apiService = new ApiService()
