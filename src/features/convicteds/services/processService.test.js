import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiService } from '@/shared/infrastructure/http/apiService'
import { processService } from './processService'

vi.mock('@/shared/infrastructure/http/apiService', () => ({
  apiService: { post: vi.fn(), get: vi.fn() },
  ApiRequestError: class extends Error {
    constructor(message, options) {
      super(message)
      Object.assign(this, options)
    }
  },
}))

const number = '0001234-56.2026.8.26.0001'
const process = {
  id: '00000000-0000-0000-0000-000000000200',
  number,
  status: 'ACTIVE',
}
const page = (items) => ({ content: items, total_elements: items.length, total_pages: 1 })

beforeEach(() => vi.resetAllMocks())

describe('processService.create', () => {
  it('validates and canonicalizes the number before sending it', async () => {
    apiService.post.mockResolvedValue(process)
    const result = await processService.create('00012345620268260001')
    expect(apiService.post).toHaveBeenCalledWith('/processes', { number })
    expect(result).toEqual({ ...process, linkedConvictedCount: 0, linkedConvictedNames: [] })
    await expect(processService.create('invalid')).rejects.toThrow()
    expect(apiService.post).toHaveBeenCalledTimes(1)
  })

  it('reuses an accessible active process after a concurrent duplicate', async () => {
    apiService.post.mockRejectedValue({ status: 409 })
    apiService.get.mockResolvedValue(page([process]))
    const result = await processService.create(number)
    expect(result.id).toBe(process.id)
  })

  it('preserves a duplicate conflict when the process is not selectable', async () => {
    const conflict = { status: 409, message: 'Processo já cadastrado.' }
    apiService.post.mockRejectedValue(conflict)
    apiService.get.mockResolvedValue(page([]))
    await expect(processService.create(number)).rejects.toBe(conflict)
  })

  it('does not retry creation after an unrelated failure', async () => {
    const failure = new Error('Falha ao cadastrar.')
    apiService.post.mockRejectedValue(failure)
    await expect(processService.create(number)).rejects.toBe(failure)
    expect(apiService.get).not.toHaveBeenCalled()
  })
})
