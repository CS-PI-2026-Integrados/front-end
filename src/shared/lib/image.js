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

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => resolve(event.target.result)
      img.src = event.target.result
    }
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}
