const relativeTime = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

export function formatRelativeTime(createdAt) {
  const elapsed = Math.max(0, Date.now() - new Date(createdAt).getTime())
  const minutes = Math.floor(elapsed / 60000)
  if (minutes < 1) return 'Agora mesmo'
  if (minutes < 60) return relativeTime.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return relativeTime.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  if (days < 30) return relativeTime.format(-days, 'day')
  if (days < 365) return relativeTime.format(-Math.floor(days / 30), 'month')
  return relativeTime.format(-Math.floor(days / 365), 'year')
}
