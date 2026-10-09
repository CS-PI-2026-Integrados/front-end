import { z } from 'zod'

export const photoSchema = z
  .instanceof(Blob, { message: 'Selecione uma foto.' })
  .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), 'Use uma foto JPEG ou PNG.')
  .refine(
    (file) => file.size > 0 && file.size <= 5 * 1024 * 1024,
    'A foto deve ter até 5 MiB e não pode estar vazia.'
  )

/** Accepts camera data URLs or files; does not fetch arbitrary external URLs. */
export function toPhotoBlob(photo) {
  if (photo instanceof Blob) return photoSchema.parse(photo)
  if (typeof photo === 'string') {
    const match = /^data:(image\/(?:jpeg|png));base64,([A-Za-z0-9+/=]+)$/.exec(photo)
    if (match) {
      const bytes = Uint8Array.from(atob(match[2]), (character) => character.charCodeAt(0))
      return photoSchema.parse(new Blob([bytes], { type: match[1] }))
    }
  }
  return photoSchema.parse(null)
}

/** Prepares cadastral and attendance uploads with the same dimensions and JPEG quality. */
export async function normalizePhoto(photo) {
  const source = toPhotoBlob(photo)
  const preview = await compressImage(source, 300, 300, 0.8)
  if (!preview) throw new Error('Não foi possível preparar a foto. Selecione outra imagem.')
  return toPhotoBlob(preview)
}

/**
 * Comprime e redimensiona uma imagem (Blob/File) no navegador usando HTMLCanvasElement.
 *
 * @param {Blob|File} file - Arquivo de imagem a ser comprimido.
 * @param {number} [maxWidth=300] - Largura máxima em pixels.
 * @param {number} [maxHeight=300] - Altura máxima em pixels.
 * @param {number} [quality=0.75] - Qualidade da compressão JPEG (0 a 1).
 * @returns {Promise<string|null>} Data URL em base64 da imagem comprimida ou null se falhar.
 */
export function compressImage(file, maxWidth = 300, maxHeight = 300, quality = 0.75) {
  return new Promise((resolve) => {
    if (!file || !(file instanceof Blob)) {
      return resolve(null)
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        const scale = Math.min(1, maxWidth / width, maxHeight / height)
        width = Math.max(1, Math.round(width * scale))
        height = Math.max(1, Math.round(height * scale))

        canvas.width = width
        canvas.height = height
        try {
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = event.target.result
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}
