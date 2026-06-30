const AUTH_TOKEN_STORAGE_KEY = '@sicape:token'

export const getStoredToken = () => {
  return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

export const saveStoredToken = (token) => {
  sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

export const clearStoredToken = () => {
  sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}
