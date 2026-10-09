import { z } from 'zod'
import { ApiRequestError } from './apiService'

/** Validate an external response before it reaches application state. */
export function parseApiResponse(schema, value) {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new ApiRequestError('A API retornou dados incompatíveis com o contrato esperado.', {
      cause: result.error,
    })
  }
  return result.data
}

/** Normalize local contract validation without exposing technical Zod messages to the UI. */
export function parseApiInput(schema, value) {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new ApiRequestError('Verifique os campos informados.', {
      kind: 'validation',
      fields: result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
      cause: result.error,
    })
  }
  return result.data
}

export const pageParamsSchema = z.object({
  page: z.number().int().min(0).default(0),
  size: z.number().int().min(1).max(100).default(20),
})

/** Canonical pagination shared by feature services; the API uses zero-based pages. */
export function parsePage(response, itemSchema, mapper) {
  const page = parseApiResponse(
    z.object({
      content: z.array(itemSchema),
      page: z.number().int().nonnegative(),
      size: z.number().int().positive(),
      total_elements: z.number().int().nonnegative(),
      total_pages: z.number().int().nonnegative(),
    }),
    response
  )
  return {
    items: page.content.map(mapper),
    page: page.page,
    size: page.size,
    totalItems: page.total_elements,
    totalPages: page.total_pages,
  }
}
