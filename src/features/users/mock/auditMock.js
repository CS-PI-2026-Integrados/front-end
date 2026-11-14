const AUDIT_STORAGE_KEY = '@sicape:audit-events'

const getStoredAuditEvents = () => {
  localStorage.removeItem(AUDIT_STORAGE_KEY)
  const storedEvents = sessionStorage.getItem(AUDIT_STORAGE_KEY)

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

  sessionStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify([nextEvent, ...events]))

  return nextEvent
}
