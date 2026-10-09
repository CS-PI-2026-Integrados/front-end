import { z } from 'zod'
import { apiService, ApiRequestError } from '@/shared/infrastructure/http/apiService'
import {
  parseApiResponse,
  parseApiInput,
  parsePage,
  pageParamsSchema,
} from '@/shared/infrastructure/http/apiContracts'
import { normalizePhoto } from '@/shared/lib/image'
import { getConvictedById } from '@/features/convicteds'

const employmentStatus = z.enum(['FORMAL_WORK', 'INFORMAL_WORK', 'UNEMPLOYED'])
const periodSchema = z
  .object({
    year: z.number().int().min(1).max(9998).optional(),
    month: z.number().int().min(1).max(12).optional(),
  })
  .refine(({ year, month }) => month === undefined || year !== undefined, {
    path: ['year'],
    message: 'Selecione um ano para filtrar por mês.',
  })
const addressSchema = z.object({
  zip_code: z.string(),
  street: z.string(),
  number: z.string(),
  complement: z.string().nullable().optional(),
  neighborhood: z.string(),
  city: z.string(),
  state: z.string(),
})
const responseSchema = z.object({
  id: z.string(),
  convicted_id: z.string(),
  process_id: z.string(),
  address: addressSchema,
  phone: z.string(),
  employment_status: employmentStatus,
  user_id: z.string(),
  user_name: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string(),
})
const required = z.string().trim().min(1, 'Campo obrigatório.')
const inputSchema = z.object({
  convictedId: z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, 'UUID inválido.'),
  processId: z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i, 'UUID inválido.'),
  employmentStatus,
  phone: required
    .transform((phone) => phone.replace(/\D/g, ''))
    .refine((phone) => /^\d{10,11}$/.test(phone), 'Informe um telefone com DDD.'),
  address: z.object({
    zipCode: required
      .transform((zip) => zip.replace(/\D/g, ''))
      .refine((zip) => /^\d{8}$/.test(zip), 'Informe um CEP com 8 dígitos.'),
    street: required,
    number: required,
    complement: z.string().nullable().optional(),
    neighborhood: required,
    city: required,
    state: required
      .transform((state) => state.toUpperCase())
      .refine((state) => /^[A-Z]{2}$/.test(state), 'Informe a UF com duas letras.'),
  }),
})
const toAttendance = (item) => ({
  id: item.id,
  convictedId: item.convicted_id,
  processId: item.process_id,
  address: {
    zipCode: item.address.zip_code,
    street: item.address.street,
    number: item.address.number,
    complement: item.address.complement || '',
    neighborhood: item.address.neighborhood,
    city: item.address.city,
    state: item.address.state,
  },
  phone: item.phone,
  employmentStatus: item.employment_status,
  userId: item.user_id,
  operatorName: item.user_name || null,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
})
let revision = 0
const listeners = new Set()
/** Subscribes to invalidation only; no attendance data is persisted or cached globally. */
export const subscribeAttendanceChanges = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getAttendanceRevision = () => revision

async function enrich(items, options = {}, identities = new Map()) {
  const ids = [...new Set(items.map((item) => item.convictedId))].filter(
    (id) => !identities.has(id)
  )
  for (let start = 0; start < ids.length; start += 4) {
    await Promise.all(
      ids.slice(start, start + 4).map(async (id) => {
        try {
          identities.set(id, await getConvictedById(id, options))
        } catch (error) {
          if (error.name === 'AbortError' || error.kind === 'auth') throw error
          identities.set(id, null)
        }
      })
    )
  }
  return items.map((item) => {
    const convicted = identities.get(item.convictedId)
    return {
      ...item,
      convictedName: convicted?.fullName || 'Indisponível',
      convictedCpf: convicted?.cpf || 'Indisponível',
      processNumber:
        convicted?.processes?.find((process) => process.id === item.processId)?.number ||
        'Indisponível',
      verificationCode: item.id,
    }
  })
}
async function readPage({ search, year, month, page = 0, size = 20, signal, timeoutMs } = {}) {
  const params = new URLSearchParams(parseApiInput(pageParamsSchema, { page, size }))
  const period = parseApiInput(periodSchema, { year, month })
  if (period.year !== undefined) params.set('year', String(period.year))
  if (period.month !== undefined) params.set('month', String(period.month))
  if (search?.trim()) params.set('search', search.trim())
  return parsePage(
    await apiService.get(`/attendance?${params}`, { signal, timeoutMs }),
    responseSchema,
    toAttendance
  )
}

/** Official /attendance contract. Canonical data, ApiRequestError, no local persistence. */
export const attendanceService = {
  async listMonths(year, options) {
    const period = parseApiInput(periodSchema, { year })
    if (period.year === undefined)
      throw new ApiRequestError('Selecione um ano.', { kind: 'validation' })
    return parseApiResponse(
      z.object({ counts: z.array(z.number().int().nonnegative()).length(12) }),
      await apiService.get(`/attendance/months?year=${period.year}`, options)
    ).counts
  },
  async listYears(options) {
    return parseApiResponse(
      z.object({ years: z.array(z.number().int().min(1).max(9998)).min(1) }),
      await apiService.get('/attendance/years', options)
    ).years
  },
  /** Lists one API page (zero-based, size 1..100), with current convicted identity enrichment. */
  async list(params = {}) {
    const page = await readPage(params)
    return { ...page, items: await enrich(page.items, params) }
  },
  /** Complete dataset for dashboard metrics only. Every backend request stays paginated. */
  async listAll(options = {}) {
    const first = await readPage({ size: 100, ...options })
    const items = [...first.items]
    for (let page = 1; page < first.totalPages; page++)
      items.push(...(await readPage({ page, size: 100, ...options })).items)
    return { ...first, items: await enrich(items, options) }
  },
  /** Gets an attendance snapshot and current identity display fields. */
  async getById(id, options) {
    const record = toAttendance(
      parseApiResponse(responseSchema, await apiService.get(`/attendance/${id}`, options))
    )
    return (await enrich([record], options))[0]
  },
  /** Normalizes JPEG/PNG input and creates attendance with JSON `data` + JPEG `photo`. */
  async create({ photo, ...input }, options) {
    const parsed = inputSchema.safeParse(input)
    if (!parsed.success)
      throw new ApiRequestError('Verifique os dados do atendimento.', {
        kind: 'validation',
        fields: parsed.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    let blob
    try {
      blob = await normalizePhoto(photo)
    } catch (cause) {
      throw new ApiRequestError('Use uma foto JPEG ou PNG de até 5 MiB.', {
        kind: 'validation',
        fields: [{ field: 'photo', message: 'Foto inválida.' }],
        cause,
      })
    }
    const data = parsed.data
    const form = new FormData()
    form.append(
      'data',
      new Blob(
        [
          JSON.stringify({
            convicted_id: data.convictedId,
            process_id: data.processId,
            address: {
              zip_code: data.address.zipCode,
              street: data.address.street,
              number: data.address.number,
              complement: data.address.complement?.trim() || null,
              neighborhood: data.address.neighborhood,
              city: data.address.city,
              state: data.address.state,
            },
            phone: data.phone,
            employment_status: data.employmentStatus,
          }),
        ],
        { type: 'application/json' }
      )
    )
    form.append('photo', blob, 'attendance-photo.jpg')
    const record = toAttendance(
      parseApiResponse(responseSchema, await apiService.post('/attendance', form, options))
    )
    revision += 1
    listeners.forEach((listener) => listener())
    return record
  },
  /** Returns the protected presence photo as Blob. */
  getPhoto: (id, options) => apiService.getBlob(`/attendance/${id}/photo`, options),
  /** Returns the official PDF as Blob; disposition is inline or attachment. */
  getReceipt(id, { disposition = 'inline', ...options } = {}) {
    parseApiInput(z.enum(['inline', 'attachment']), disposition)
    return apiService.getBlob(`/attendance/${id}/receipt?disposition=${disposition}`, options)
  },
}
