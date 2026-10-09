import { z } from 'zod'

const addressTextSchema = z.string().transform((value, context) => {
  const parts = value.split('·').map((part) => part.trim())
  const streetAndNumber = parts[0]?.match(/^(.+?)\s+(\d[\w/-]*|s\/n)$/i)
  const [neighborhood, city, state] = parts.slice(-3)
  if (
    ![4, 5].includes(parts.length) ||
    !streetAndNumber ||
    !neighborhood ||
    !city ||
    !/^[a-z]{2}$/i.test(state || '')
  ) {
    context.addIssue({
      code: 'custom',
      message: 'Informe logradouro e número · complemento (opcional) · bairro · cidade · UF.',
    })
    return z.NEVER
  }
  return {
    street: streetAndNumber[1],
    number: streetAndNumber[2],
    complement: parts.length === 5 ? parts[1] : '',
    neighborhood,
    city,
    state: state.toUpperCase(),
  }
})

export const receiptAddressSchema = z
  .object({
    address: addressTextSchema,
    zipCode: z
      .string()
      .trim()
      .regex(/^\d{5}-?\d{3}$/, 'Informe um CEP com 8 dígitos.')
      .transform((value) => value.replace('-', '')),
  })
  .transform(({ address, zipCode }) => ({ ...address, zipCode }))
