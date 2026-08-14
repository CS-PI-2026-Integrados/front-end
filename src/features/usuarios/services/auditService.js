import { appendAuditEvent } from '@/features/usuarios/mock/auditMock'

export const registerUserAuditAction = async ({ action, actor, target }) => {
  return appendAuditEvent({
    scope: 'E06',
    entity: 'user',
    action,
    tenantId: actor.tenantId,
    actorId: actor.id,
    actorRoleId: actor.roleId,
    actorRoleKey: actor.role?.key,
    targetId: target.id,
    targetRoleId: target.roleId,
    targetRoleKey: target.role?.key,
  })
}
