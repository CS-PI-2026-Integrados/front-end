export function readJson(key, fallback) {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback

  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Operational records must not remain on shared workstations across sessions.
export function readSessionJson(key, fallback) {
  localStorage.removeItem(key)
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeSessionJson(key, value) {
  localStorage.removeItem(key)
  sessionStorage.setItem(key, JSON.stringify(value))
}

export function clearSensitiveBrowserData() {
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of Object.keys(storage)) {
      if (key.startsWith('sicape:group-conversation:') || key.startsWith('@sicape:'))
        storage.removeItem(key)
    }
  }
}
