import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'

const AUDIT_STORAGE_KEY = '@sicape:audit-events'

export function registerDocumentReissue({ tenantId, actorId, documentId, documentType }) {
  const events = readJson(AUDIT_STORAGE_KEY, [])
  const nextEvent = {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    scope: 'E06',
    entity: 'document',
    action: 'reissue',
    tenantId,
    actorId,
    documentId,
    documentType,
  }
  writeJson(AUDIT_STORAGE_KEY, [nextEvent, ...events])
  return nextEvent
}
