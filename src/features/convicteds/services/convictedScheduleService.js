import { z } from 'zod'
import { parseApiInput, parseApiResponse } from '@/shared/infrastructure/http/apiContracts'
import { apiService } from '@/shared/infrastructure/http/apiService'

const querySchema = z.object({ id: z.guid(), from: z.iso.date(), to: z.iso.date() })
const eventSchema = z.object({
  id: z.guid(),
  origin: z.enum(['REFLECTION_GROUP', 'INDIVIDUAL_APPEARANCE']),
  date: z.iso.date(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
  title: z.string(),
  time: z.string().nullable(),
  process_id: z.guid().nullable(),
  participation_status: z.enum(['PRESENTE', 'AUSENTE', 'JUSTIFICADO']).nullable(),
  receipt_issued: z.boolean().nullable(),
})

export async function getConvictedSchedule(input, { signal } = {}) {
  const { id, from, to } = parseApiInput(querySchema, input)
  const params = new URLSearchParams({ from, to })
  const result = await apiService.get(`/convicted/${id}/schedule?${params}`, { signal })
  return parseApiResponse(z.array(eventSchema), result).map((event) => ({
    id: event.id,
    origin: event.origin,
    date: event.date,
    time: event.time,
    title: event.title,
    status: event.status,
    processId: event.process_id,
    participationStatus: event.participation_status,
    receiptIssued: event.receipt_issued,
  }))
}
