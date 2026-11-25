import { z } from 'zod'

export const processNumberSchema = z
  .string()
  .trim()
  .regex(
    /^(?:[0-9]{20}|[0-9]{7}-[0-9]{2}\.[0-9]{4}\.[0-9]\.[0-9]{2}\.[0-9]{4})$/,
    'Informe o número no formato 0000000-00.0000.0.00.0000.'
  )
  .transform((value) =>
    value
      .replace(/\D/g, '')
      .replace(/^(\d{7})(\d{2})(\d{4})(\d)(\d{2})(\d{4})$/, '$1-$2.$3.$4.$5.$6')
  )

export const processResponseSchema = z.object({
  id: z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i),
  number: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  linked_convicted_count: z.number().int().nonnegative().optional().default(0),
  linked_convicted_names: z.array(z.string()).optional().default([]),
})
