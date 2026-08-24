export function formatPhone(val) {
  if (!val) return ''
  let value = String(val).replace(/\D/g, '')
  if (value.length > 11) value = value.slice(0, 11)

  if (value.length > 10) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`
  } else if (value.length > 6) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`
  } else if (value.length > 2) {
    return `(${value.slice(0, 2)}) ${value.slice(2)}`
  }
  return value
}
