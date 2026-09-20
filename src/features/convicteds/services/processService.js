import { apiService } from '@/shared/infrastructure/http/apiService'

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
  async search({ query, page = 1, limit = 20, signal }) {
    const pageIndex = Math.max(0, page - 1)
    const params = new URLSearchParams({
      page: String(pageIndex),
      size: String(limit),
    })

    if (query?.trim()) params.set('search', query.trim())

    const response = await apiService.get(`/processes?${params.toString()}`, { signal })

    return {
      items: Array.isArray(response?.content) ? response.content.map(toProcess) : [],
      totalItems: Number.isFinite(response?.total_elements) ? response.total_elements : 0,
      totalPages: Math.max(1, Number.isInteger(response?.total_pages) ? response.total_pages : 1),
    }
  },
}
