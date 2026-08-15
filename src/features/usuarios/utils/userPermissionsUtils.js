export const ROLE_KEYS = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
}

export const isPrivilegedRole = (role) => {
  return role?.key === ROLE_KEYS.ADMIN
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

export const canManageUser = (actor, target) => {
  if (!actor || !target) return false
  if (!canAccessUsersPage(actor)) return false
  if (!isSameTenant(actor, target)) return false
  if (isSameUser(actor, target)) return false

  return true
}

export const canDeactivateUser = (actor, target) => {
  return canManageUser(actor, target) && target.isActive
}

export const canReactivateUser = (actor, target) => {
  return canManageUser(actor, target) && !target.isActive
}

export const canResetUserPassword = (actor, target) => {
  return canManageUser(actor, target) && target.isActive
}
