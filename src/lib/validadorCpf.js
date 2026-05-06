export const formatCpf = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
}

export const validateCPF = (cpf) => {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || !!digits.match(/^(\d)\1+$/)) return false

  const calcDigit = (slice, factor) => {
    let sum = 0
    for (const char of slice) {
      sum += parseInt(char) * factor--
    }
    const result = (sum * 10) % 11
    return result >= 10 ? 0 : result
  }

  const digit1 = calcDigit(digits.slice(0, 9), 10)
  const digit2 = calcDigit(digits.slice(0, 10), 11)

  return digit1 === parseInt(digits[9]) && digit2 === parseInt(digits[10])
}
