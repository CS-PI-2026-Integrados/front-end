const AUDIT_STORAGE_KEY = '@sicape:audit-events'

const getStoredAuditEvents = () => {
  const storedEvents = localStorage.getItem(AUDIT_STORAGE_KEY)

  if (!storedEvents) return []

  try {
    return JSON.parse(storedEvents)
  } catch {
    return []
  }
}

export const appendAuditEvent = async (event) => {
  const events = getStoredAuditEvents()
  const nextEvent = {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    ...event,
  }

  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([nextEvent, ...events]))

  return nextEvent
}
