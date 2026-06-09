const AUTH_TOKEN_STORAGE_KEY = '@sicape:token'

export const getStoredToken = () => {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export const saveStoredToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export const clearStoredToken = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}
