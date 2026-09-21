import { apiService } from '@/shared/infrastructure/http/apiService'

const normalizeAddressFromApi = (address) => {
  if (!address) return null
  return {
    zipCode: address.zip_code || address.zipCode || '',
    street: address.street || '',
    number: address.number || '',
    complement: address.complement || '',
    neighborhood: address.neighborhood || '',
    city: address.city || '',
    state: address.state || '',
  }
}

const toConvictedListItem = (item) => ({
  id: item.id,
  name: item.name,
  fullName: item.name,
  cpf: item.cpf,
  photoUrl: item.photo_url,
  phone: item.phone,
  address: normalizeAddressFromApi(item.address),
  employmentStatus: item.employment_status,
  mainProcessNumber: item.main_process_number,
  sameProcessConvictedCount: item.same_process_convicted_count || 0,
})

const toConvictedDetail = (item) => ({
  id: item.id,
  name: item.name,
  fullName: item.name,
  cpf: item.cpf,
  birthDate: item.birth_date || '',
  phone: item.phone || '',
  address: normalizeAddressFromApi(item.address) || {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  },
  employmentStatus: item.employment_status || '',
  status: item.status || '',
  photoUrl: item.photo_url || null,
  processes: Array.isArray(item.processes)
    ? item.processes.map((proc) => ({
        id: proc.id,
        number: proc.number,
        status: proc.status,
        principal: Boolean(proc.principal),
      }))
    : [],
})

class ConvictedService {
  async list({ search, page = 1, limit = 25, signal }) {
    const pageIndex = Math.max(0, page - 1)

    const params = new URLSearchParams({
      page: String(pageIndex),
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

  async getById(id, { signal } = {}) {
    if (!id) throw new Error('ID do apenado é obrigatório.')

    const response = await apiService.get(`/convicted/${id}`, { signal })
    return toConvictedDetail(response)
  }

  async create(data) {
    const payload = {
      name: data.name?.trim(),
      cpf: (data.cpf || '').replace(/\D/g, ''),
      birth_date: data.birthDate,
      phone: data.phone?.trim(),
      address: {
        zip_code: (data.address?.zipCode || '').replace(/\D/g, ''),
        street: data.address?.street?.trim(),
        number: data.address?.number?.trim(),
        complement: data.address?.complement?.trim() || null,
        neighborhood: data.address?.neighborhood?.trim(),
        city: data.address?.city?.trim(),
        state: data.address?.state?.trim()?.toUpperCase(),
      },
      processes: Array.isArray(data.processes)
        ? data.processes.map((process) => ({
            id: process.id,
            principal: Boolean(process.principal),
          }))
        : [],
    }

    const response = await apiService.post('/convicted', payload)
    return toConvictedDetail(response)
  }

  async update(id, data) {
    if (!id) throw new Error('ID do apenado é obrigatório.')

    const payload = {}

    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.cpf !== undefined) payload.cpf = data.cpf.replace(/\D/g, '')
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate
    if (data.phone !== undefined) payload.phone = data.phone.trim()
    if (data.status !== undefined) payload.status = data.status
    if (data.address) {
      payload.address = {
        zip_code: (data.address.zipCode || '').replace(/\D/g, ''),
        street: data.address.street?.trim(),
        number: data.address.number?.trim(),
        complement: data.address.complement?.trim() || null,
        neighborhood: data.address.neighborhood?.trim(),
        city: data.address.city?.trim(),
        state: data.address.state?.trim()?.toUpperCase(),
      }
    }

    if (Array.isArray(data.processes)) {
      payload.processes = data.processes.map((p) => ({
        id: p.id,
        principal: Boolean(p.principal),
      }))
    }

    const response = await apiService.put(`/convicted/${id}`, payload)
    return toConvictedDetail(response)
  }

  async deactivate(id) {
    if (!id) throw new Error('ID do apenado é obrigatório.')
    return this.update(id, { status: 'INACTIVE' })
  }

  async remove(id) {
    return this.deactivate(id)
  }

  async uploadPhoto(id, file) {
    if (!id) throw new Error('ID do apenado é obrigatório.')
    if (!file) throw new Error('Arquivo de foto é obrigatório.')

    const formData = new FormData()
    formData.append('photo', file)

    const response = await apiService.put(`/convicted/${id}/photo`, formData)
    return toConvictedDetail(response)
  }

  async getPhoto(id, { signal } = {}) {
    if (!id) throw new Error('ID do apenado é obrigatório.')
    return apiService.getBlob(`/convicted/${id}/photo`, { signal })
  }

  async searchCep(cep, { signal } = {}) {
    const cleanCep = (cep || '').replace(/\D/g, '')
    if (cleanCep.length !== 8) return null

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, { signal })
      if (!response.ok) return null

      const data = await response.json()
      if (data.erro) return null

      return {
        zipCode: cleanCep,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }
    } catch {
      return null
    }
  }
}

export const convictedService = new ConvictedService()
