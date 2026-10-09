import { z } from 'zod'
import { apiService, ApiRequestError } from '@/shared/infrastructure/http/apiService'
import {
  parseApiInput,
  parseApiResponse,
  parsePage,
} from '@/shared/infrastructure/http/apiContracts'
import { createUserSchema } from '@/features/users/schemas/userSchemas'
import {
  ROLE_KEYS,
  canAccessUsersPage,
  canDeactivateUser,
  canReactivateUser,
  canResetUserPassword,
  isSameTenant,
} from '@/features/users/utils/userPermissionsUtils'
import { normalizeCpf } from '@/shared/lib/cpf'

const roles = {
  admin: { id: 'admin', key: 'admin', label: 'Administrador', level: 2 },
  operator: { id: 'operator', key: 'operator', label: 'Operador', level: 1 },
}
const userResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  cpf: z.string(),
  email: z.string(),
  role: z.enum([ROLE_KEYS.ADMIN, ROLE_KEYS.OPERATOR]),
  district_id: z.string().nullable().optional(),
  is_active: z.boolean(),
  must_change_password: z.boolean(),
  created_at: z.string().nullable().optional(),
})
const toUser = (user) => ({
  id: user.id,
  name: user.name,
  cpf: user.cpf,
  email: user.email,
  tenantId: user.district_id ?? null,
  roleId: user.role,
  role: { ...roles[user.role] },
  isActive: user.is_active,
  mustChangePassword: user.must_change_password,
  createdAt: user.created_at ?? null,
})
const parseUser = (response) => toUser(parseApiResponse(userResponseSchema, response))

const getActor = (session) => {
  const actor = session?.user
  if (!actor?.id || !actor.tenantId || actor.tenantId !== session?.tenant?.id) {
    throw new ApiRequestError('Sessão inválida.', { kind: 'auth' })
  }
  if (!canAccessUsersPage(actor)) {
    throw new ApiRequestError('Usuário sem permissão para gerenciar acessos.', { kind: 'auth' })
  }
  return actor
}

const getTarget = async (session, targetUserId, permission, options) => {
  const actor = getActor(session)
  const id = parseApiInput(z.string().min(1), targetUserId)
  const target = parseUser(await apiService.get(`/usuarios/${encodeURIComponent(id)}`, options))
  if (!isSameTenant(actor, target) || !permission(actor, target)) {
    throw new ApiRequestError('Usuário sem permissão para realizar esta ação.', { kind: 'auth' })
  }
  return target
}

// Preserve local filters and comarca-wide metrics by reading every API page.
export const listManageableTenantUsers = async (session, options) => {
  const actor = getActor(session)
  const users = []
  let page = 0
  let totalPages
  do {
    const result = parsePage(
      await apiService.get(`/usuarios?page=${page}&size=100`, options),
      userResponseSchema,
      toUser
    )
    if (result.page !== page)
      throw new ApiRequestError('Não foi possível carregar todos os usuários.')
    users.push(...result.items.filter((user) => isSameTenant(actor, user)))
    totalPages = result.totalPages
    page += 1
  } while (page < totalPages)
  return users
}

export const createTenantOperator = async ({ session, operatorData }, options) => {
  getActor(session)
  const input = parseApiInput(createUserSchema, operatorData)
  try {
    return parseUser(
      await apiService.post(
        '/usuarios',
        {
          name: input.name,
          cpf: normalizeCpf(input.cpf),
          email: input.email,
          role: input.roleKey,
          password: input.password,
        },
        options
      )
    )
  } catch (cause) {
    if (cause instanceof ApiRequestError) {
      cause.fields = cause.fields.map((field) => ({
        ...field,
        field: field.field === 'role' ? 'roleKey' : field.field,
      }))
    }
    throw cause
  }
}

export const deactivateTenantUser = async ({ session, targetUserId }, options) => {
  const target = await getTarget(session, targetUserId, canDeactivateUser, options)
  await apiService.delete(`/usuarios/${encodeURIComponent(target.id)}`, options)
  return { ...target, isActive: false }
}

const updateTarget = async (target, changes, options) =>
  parseUser(
    await apiService.put(
      `/usuarios/${encodeURIComponent(target.id)}`,
      { name: target.name, email: target.email, role: target.role.key, ...changes },
      options
    )
  )

export const reactivateTenantUser = async ({ session, targetUserId }, options) => {
  const target = await getTarget(session, targetUserId, canReactivateUser, options)
  return updateTarget(target, { is_active: true }, options)
}

export const resetTenantUserPassword = async ({ session, targetUserId }, options) => {
  const target = await getTarget(session, targetUserId, canResetUserPassword, options)
  const random = crypto.getRandomValues(new Uint8Array(16))
  const temporaryPassword = `Sicape@${Array.from(random, (value) => value.toString(16).padStart(2, '0')).join('')}`
  const user = await updateTarget(target, { password: temporaryPassword }, options)
  return { user, temporaryPassword }
}
