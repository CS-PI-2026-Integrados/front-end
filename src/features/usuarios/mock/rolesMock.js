import { mockCargos } from '@/features/usuarios/mock/cargosIniciais'

export const listRoles = async () => {
  return mockCargos.cargos
}

export const findRoleById = async (roleId) => {
  return mockCargos.cargos.find((role) => role.id === roleId) || null
}

export const findRoleByKey = async (roleKey) => {
  return mockCargos.cargos.find((role) => role.key === roleKey) || null
}
