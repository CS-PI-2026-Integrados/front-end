import { z } from 'zod'
import { parseApiInput, parseApiResponse } from '@/shared/infrastructure/http/apiContracts'
import { apiService } from '@/shared/infrastructure/http/apiService'

const querySchema = z.object({ id: z.uuid(), from: z.iso.date(), to: z.iso.date() })
const eventSchema = z.object({
  id: z.uuid(),
  origin: z.enum(['REFLECTION_GROUP', 'INDIVIDUAL_APPEARANCE']),
  date: z.iso.date(),
  status: z.enum(['SCHEDULED', 'CANCELLED']),
})

export async function getConvictedSchedule(input, { signal } = {}) {
  const { id, from, to } = parseApiInput(querySchema, input)
  const params = new URLSearchParams({ from, to })
  const result = await apiService.get(`/convicted/${id}/schedule?${params}`, { signal })
  return parseApiResponse(z.array(eventSchema), result)
}
