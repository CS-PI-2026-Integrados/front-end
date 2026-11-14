import { readSessionJson, writeSessionJson } from '@/shared/infrastructure/storage/jsonStorage'

export const registerUserAuditAction = async ({ action, actor, target }) => {
  const event = {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
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
  }
  writeSessionJson('@sicape:audit-events', [event, ...readSessionJson('@sicape:audit-events', [])])
  return event
}
