import { z } from 'zod'
import {
  parseApiResponse,
  parseApiInput,
  parsePage,
  pageParamsSchema,
} from '@/shared/infrastructure/http/apiContracts'
import { normalizePhoto, photoSchema } from '@/shared/lib/image'
import { apiService, ApiRequestError } from '@/shared/infrastructure/http/apiService'

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

const responseSchema = z.object({
  id: z.string(),
  name: z.string(),
  cpf: z.string(),
  phone: z.string().optional(),
  address: z
    .object({
      zip_code: z.string(),
      street: z.string(),
      number: z.string(),
      complement: z.string().nullable().optional(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
    })
    .nullable()
    .optional(),
  employment_status: z.enum(['FORMAL_WORK', 'INFORMAL_WORK', 'UNEMPLOYED']).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  processes: z
    .array(
      z.object({ id: z.string(), number: z.string(), status: z.string(), principal: z.boolean() })
    )
    .optional(),
  birth_date: z.string().optional(),
  main_process_number: z.string().optional(),
  same_process_convicted_count: z.number().optional(),
})

const detailResponseSchema = responseSchema.extend({
  status: z.enum(['ACTIVE', 'INACTIVE']),
  birth_date: z.string(),
  phone: z.string(),
  processes: z.array(
    z.object({ id: z.string(), number: z.string(), status: z.string(), principal: z.boolean() })
  ),
})

const toConvictedListItem = (item) => ({
  id: item.id,
  name: item.name,
  fullName: item.name,
  cpf: item.cpf,
  photoUrl: item.photoUrl || item.photo_url || null,
  phone: item.phone,
  address: normalizeAddressFromApi(item.address),
  employmentStatus: item.employmentStatus || item.employment_status || '',
  mainProcessNumber: item.mainProcessNumber || item.main_process_number || '',
  sameProcessConvictedCount:
    item.sameProcessConvictedCount ?? item.same_process_convicted_count ?? 0,
  status: item.status || item.situacao || '',
  tenantId:
    item.tenantId ||
    item.tenant_id ||
    item.judicialDistrictId ||
    item.judicial_district_id ||
    item.judicialDistrict?.id ||
    item.judicial_district?.id ||
    null,
})

const toConvictedDetail = (item) => ({
  id: item.id,
  name: item.name,
  fullName: item.name,
  cpf: item.cpf,
  birthDate: item.birthDate || item.birth_date || '',
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
  employmentStatus: item.employmentStatus || item.employment_status || '',
  status: item.status || '',
  photoUrl: item.photoUrl || item.photo_url || null,
  processes: Array.isArray(item.processes)
    ? item.processes.map((proc) => ({
        id: proc.id,
        number: proc.number,
        status: proc.status,
        principal: Boolean(proc.principal),
      }))
    : [],
})

let photoRevision = 0
const photoListeners = new Set()
export const getPhotoRevision = () => photoRevision
export const subscribePhotoChanges = (listener) => {
  photoListeners.add(listener)
  return () => photoListeners.delete(listener)
}

class ConvictedService {
  /** Lists convicteds. page is zero-based; size is 1..100. Supports AbortSignal. */
  async list({ search, status, page = 0, size = 20, signal, timeoutMs } = {}) {
    const params = new URLSearchParams(parseApiInput(pageParamsSchema, { page, size }))
    if (search?.trim()) params.set('search', search.trim())
    if (status) params.set('status', parseApiInput(z.enum(['ACTIVE', 'INACTIVE']), status))
    return parsePage(
      await apiService.get(`/convicted?${params}`, { signal, timeoutMs }),
      responseSchema,
      toConvictedListItem
    )
  }

  /** Gets canonical cadastral detail and linked processes; accepts signal. */
  async getById(id, options) {
    if (!id)
      throw new ApiRequestError('ID do apenado é obrigatório.', {
        kind: 'validation',
        fields: [{ field: 'id', message: 'Campo obrigatório.' }],
      })

    const response = await apiService.get(`/convicted/${id}`, options)
    return toConvictedDetail(parseApiResponse(detailResponseSchema, response))
  }

  /** Creates a convicted from camelCase data; returns cadastral detail. */
  async create(data, options) {
    const payload = {
      name: data.name?.trim(),
      cpf: (data.cpf || '').replace(/\D/g, ''),
      birth_date: data.birthDate,
      employment_status: data.employmentStatus,
      phone: data.phone?.replace(/\D/g, ''),
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

    const response = await apiService.post('/convicted', payload, options)
    return toConvictedDetail(parseApiResponse(detailResponseSchema, response))
  }

  /** Updates provided cadastral fields, including employmentStatus; returns detail. */
  async update(id, data, options) {
    if (!id)
      throw new ApiRequestError('ID do apenado é obrigatório.', {
        kind: 'validation',
        fields: [{ field: 'id', message: 'Campo obrigatório.' }],
      })

    const payload = {}

    if (data.name !== undefined) payload.name = data.name.trim()
    if (data.cpf !== undefined) payload.cpf = data.cpf.replace(/\D/g, '')
    if (data.birthDate !== undefined) payload.birth_date = data.birthDate
    if (data.phone !== undefined) payload.phone = data.phone.replace(/\D/g, '')
    if (data.employmentStatus !== undefined) payload.employment_status = data.employmentStatus
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

    const response = await apiService.put(`/convicted/${id}`, payload, options)
    return toConvictedDetail(parseApiResponse(detailResponseSchema, response))
  }

  /** Updates cadastral status using URL parameters only; returns canonical detail. */
  async updateStatus(id, status, options) {
    if (!id)
      throw new ApiRequestError('ID do apenado é obrigatório.', {
        kind: 'validation',
        fields: [{ field: 'id', message: 'Campo obrigatório.' }],
      })
    const nextStatus = parseApiInput(z.enum(['ACTIVE', 'INACTIVE']), status)
    const response = await apiService.put(
      `/convicted/${id}/status/${nextStatus}`,
      undefined,
      options
    )
    return toConvictedDetail(parseApiResponse(detailResponseSchema, response))
  }

  async deactivate(id, options) {
    return this.updateStatus(id, 'INACTIVE', options)
  }

  /** Normalizes JPEG/PNG <=5 MiB to JPEG; resolves null and invalidates photo readers. */
  async uploadPhoto(id, file, options) {
    if (!id)
      throw new ApiRequestError('ID do apenado é obrigatório.', {
        kind: 'validation',
        fields: [{ field: 'id', message: 'Campo obrigatório.' }],
      })
    parseApiInput(photoSchema, file)
    let normalized
    try {
      normalized = await normalizePhoto(file)
    } catch (cause) {
      throw new ApiRequestError('Não foi possível preparar a foto. Selecione outra imagem.', {
        kind: 'validation',
        fields: [{ field: 'photo', message: 'Selecione uma imagem válida.' }],
        cause,
      })
    }
    const formData = new FormData()
    formData.append('photo', normalized, 'convicted-photo.jpg')
    await apiService.put(`/convicted/${id}/photo`, formData, options)
    photoRevision += 1
    photoListeners.forEach((listener) => listener())
    return null
  }

  /** Gets the authenticated cadastral photo as Blob; accepts signal. */
  async getPhoto(id, options) {
    if (!id)
      throw new ApiRequestError('ID do apenado é obrigatório.', {
        kind: 'validation',
        fields: [{ field: 'id', message: 'Campo obrigatório.' }],
      })
    return apiService.getBlob(`/convicted/${id}/photo`, options)
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

export async function searchConvicteds({ search, limit = 10, signal } = {}) {
  const term = search?.trim()
  if (!term) return []

  const { items } = await convictedService.list({
    search: term,
    page: 0,
    size: limit,
    signal,
  })

  return items
}

/** Canonical detail and photo access for deliberate cross-feature integration. */
export const getConvictedById = (id, options) => convictedService.getById(id, options)
export const getConvictedPhoto = (id, options) => convictedService.getPhoto(id, options)
