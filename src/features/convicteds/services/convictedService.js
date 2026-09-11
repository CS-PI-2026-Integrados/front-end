import { apiService } from '@/shared/infrastructure/http/apiService'

const toConvictedListItem = (item) => ({
  id: item.id,
  fullName: item.name,
  cpf: item.cpf,
  photoUrl: item.photo_url,
  phone: item.phone,
  address: item.address,
  employmentStatus: item.employment_status,
  mainProcessNumber: item.main_process_number,
  sameProcessConvictedCount: item.same_process_convicted_count,
})

class ConvictedService {
  async list({ search, page = 1, limit = 25, signal }) {
    // Paginação começa a partir da posição 0 na API
    page = page - 1

    const params = new URLSearchParams({
      page: String(page),
      size: String(limit),
    })

    if (search?.trim()) {
      params.set('search', search.trim())
    }

    const response = await apiService.get(`/convicted?${params.toString()}`, { signal })

    return {
      items: Array.isArray(response?.content) ? response.content.map(toConvictedListItem) : [],
      totalItems: Number.isFinite(response?.total_elements) ? response.total_elements : 0,
      totalPages: Math.max(1, Number.isInteger(response?.total_pages) ? response.total_pages : 1),
    }
  }
}

export const convictedService = new ConvictedService()
