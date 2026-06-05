import { generateToken, validateToken } from '@/mocks/requests/token.requests.mock'
import { getUser, getUserByPayload } from '@/mocks/requests/users.requests.mock'

const AUTH_TOKEN_STORAGE_KEY = '@sicape:token'

export const findUserByCredentials = (cpf, password) => {
  return getUser(cpf, password)
}

export const findUserByTokenPayload = (payload) => {
  return getUserByPayload(payload)
}

export const createToken = (user) => {
  return generateToken(user)
}

export const validateStoredToken = (token) => {
  return validateToken(token)
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
