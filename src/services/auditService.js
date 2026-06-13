import { appendAuditEvent } from '@/repositories/audit/auditRepository.mock'

export const registerUserAuditAction = async ({ action, actor, target }) => {
  return appendAuditEvent({
    scope: 'E06',
    entity: 'user',
    action,
    tenantId: actor.tenantId,
    actorId: actor.id,
    actorRole: actor.role,
    targetId: target.id,
    targetRole: target.role,
  })
}
