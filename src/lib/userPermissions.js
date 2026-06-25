export const ROLE_KEYS = {
  OWNER: 'owner',
  ADMIN: 'admin',
  OPERATOR: 'operator',
}

export const isPrivilegedRole = (role) => {
  return role?.key === ROLE_KEYS.ADMIN || role?.key === ROLE_KEYS.OWNER
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
  return (actorRole?.level || 0) > (targetRole?.level || 0)
}

export const canManageUser = (actor, target) => {
  if (!actor || !target) return false
  if (!canAccessUsersPage(actor)) return false
  if (!isSameTenant(actor, target)) return false
  if (isSameUser(actor, target)) return false

  return isRoleAbove(actor.role, target.role)
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
