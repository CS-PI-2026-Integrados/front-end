import { apiService } from '@/shared/infrastructure/http/apiService'
import { z } from 'zod'
import { parseApiInput, parseApiResponse } from '@/shared/infrastructure/http/apiContracts'
import { processNumberSchema, processResponseSchema } from '../schemas/processSchema'

const toProcess = (process) => ({
  id: process.id,
  number: process.number,
  status: process.status,
  linkedConvictedCount: Number(process.linked_convicted_count) || 0,
  linkedConvictedNames: Array.isArray(process.linked_convicted_names)
    ? process.linked_convicted_names
    : [],
})

export const processService = {
  async create(number) {
    const normalizedNumber = parseApiInput(processNumberSchema, number)
    try {
      const response = await apiService.post('/processes', { number: normalizedNumber })
      return toProcess(parseApiResponse(processResponseSchema, response))
    } catch (error) {
      if (error.status !== 409) throw error
      // A concurrent creation can be reused only when it is active and visible in this comarca.
      const result = await this.search({ query: normalizedNumber })
      const existing = result.items.find(
        (item) => item.number.replace(/\D/g, '') === normalizedNumber.replace(/\D/g, '')
      )
      if (existing) return existing
      throw error
    }
  },

  async search({ query, page = 1, limit = 20, signal }) {
    const pageIndex = Math.max(0, page - 1)
    const params = new URLSearchParams({
      page: String(pageIndex),
      size: String(limit),
    })

    if (query?.trim()) params.set('search', query.trim())

    const response = parseApiResponse(
      z.object({
        content: z.array(processResponseSchema),
        total_elements: z.number().int().nonnegative(),
        total_pages: z.number().int().nonnegative(),
      }),
      await apiService.get(`/processes?${params.toString()}`, { signal })
    )

    return {
      items: Array.isArray(response?.content) ? response.content.map(toProcess) : [],
      totalItems: Number.isFinite(response?.total_elements) ? response.total_elements : 0,
      totalPages: Math.max(1, Number.isInteger(response?.total_pages) ? response.total_pages : 1),
    }
  },
}
