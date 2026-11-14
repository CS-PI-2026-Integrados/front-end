import { LOGO_ACCEPTED_EXTENSIONS } from '@/features/institutions/model/logoConfig'

export { LOGO_ACCEPTED_EXTENSIONS }
export const MAX_FIELD_LENGTH = 120
const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_SIZE_BYTES = 1024 * 1024

export const validateLogoFile = (file) => {
  if (!file) return { valid: false, error: 'Nenhum arquivo selecionado' }
  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Formato inválido. Envie uma imagem .png, .jpg ou .webp' }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'O arquivo deve ter no máximo 1 MB' }
  }
  return { valid: true }
}

export const convertFileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo'))
    reader.readAsDataURL(file)
  })
