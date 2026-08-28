import { apiService } from '@/shared/infrastructure/http/apiService'
import { readJson, writeJson } from '@/shared/infrastructure/storage/jsonStorage'
import { APENADOS_STORAGE_KEY, apenadosIniciais } from '@/features/convicteds/mock/convictedsMock'

export class ConvictedService {
  constructor(http) {
    this.http = http
  }

  async list({ search = '', page = 0, size = 20, signal } = {}) {
    const params = new URLSearchParams({ search, page: String(page), size: String(size) })
    const response = await this.http.get(`/convicted?${params.toString()}`, { signal })

    return response.content || []
  }

  async getById(id, { signal } = {}) {
    return this.http.get(`/convicted/${id}`, { signal })
  }

  async create() {
    throw new Error('Método create ainda não integrado à API.')
  }

  async get() {
    throw new Error('Método get ainda não integrado à API.')
  }

  async update() {
    throw new Error('Método update ainda não integrado à API.')
  }

  async remove() {
    throw new Error('Método remove ainda não integrado à API.')
  }

  async uploadPhoto() {
    throw new Error('Método uploadPhoto ainda não integrado à API.')
  }

  listApenados() {
    return readJson(APENADOS_STORAGE_KEY, apenadosIniciais)
  }

  saveApenados(apenados) {
    writeJson(APENADOS_STORAGE_KEY, apenados)
    return apenados
  }
}

export const convictedService = new ConvictedService(apiService)
