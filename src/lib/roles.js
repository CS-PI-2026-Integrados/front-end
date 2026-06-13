export const USER_ROLES = {
  OPERATOR: 'operator',
  ADMIN: 'admin',
  OWNER: 'owner',
}

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}

export const SESSION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}

export const ROLE_LEVEL = {
  [USER_ROLES.OPERATOR]: 1,
  [USER_ROLES.ADMIN]: 2,
  [USER_ROLES.OWNER]: 3,
}

export const ROLE_LABELS = {
  [USER_ROLES.OPERATOR]: 'OPERADOR',
  [USER_ROLES.ADMIN]: 'ADMIN',
  [USER_ROLES.OWNER]: 'OWNER',
}

export const STATUS_LABELS = {
  [USER_STATUS.ACTIVE]: 'ATIVO',
  [USER_STATUS.INACTIVE]: 'INATIVO',
}

export const SESSION_STATUS_LABELS = {
  [SESSION_STATUS.ACTIVE]: 'Sessão ativa',
  [SESSION_STATUS.INACTIVE]: 'Sessão inativa',
}

export const isPrivilegedRole = (role) => {
  return role === USER_ROLES.ADMIN || role === USER_ROLES.OWNER
}

export const canAccessUsersPage = (user) => {
  return isPrivilegedRole(user?.role)
}

export const isSameTenant = (actor, target) => {
  return Boolean(actor?.tenantId && target?.tenantId && actor.tenantId === target.tenantId)
}

export const isSameUser = (actor, target) => {
  return Boolean(actor?.id && target?.id && actor.id === target.id)
}

export const isRoleAbove = (actorRole, targetRole) => {
  return (ROLE_LEVEL[actorRole] || 0) > (ROLE_LEVEL[targetRole] || 0)
}

export const canManageUser = (actor, target) => {
  if (!actor || !target) return false
  if (!canAccessUsersPage(actor)) return false
  if (!isSameTenant(actor, target)) return false
  if (isSameUser(actor, target)) return false

  return isRoleAbove(actor.role, target.role)
}

export const canDeactivateUser = (actor, target) => {
  return canManageUser(actor, target) && target.status === USER_STATUS.ACTIVE
}

export const canReactivateUser = (actor, target) => {
  return canManageUser(actor, target) && target.status === USER_STATUS.INACTIVE
}

export const canResetUserPassword = (actor, target) => {
  return canManageUser(actor, target) && target.status === USER_STATUS.ACTIVE
}
