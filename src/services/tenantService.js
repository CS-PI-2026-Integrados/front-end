/**
 * Serviço de Tenant (mock).
 *
 * Centraliza regras de validação de logo e constantes reutilizáveis.
 * Em produção, as funções `validateLogoOnServer` e `saveTenantSettings`
 * seriam chamadas HTTP reais ao back-end Spring Boot.
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const ACCEPTED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024 // 1 MB

/** String de `accept` para o input[type=file] */
export const LOGO_ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.webp'

/** Limite de caracteres para campos textuais do tenant */
export const MAX_FIELD_LENGTH = 120

// ─── Validação Client-Side ─────────────────────────────────────────────────────

/**
 * Valida tipo MIME e tamanho do arquivo no lado do cliente.
 * Chamada no `onChange` do input de arquivo.
 *
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateLogoFile = (file) => {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado' }
  }

  if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Formato inválido. Envie uma imagem .png, .jpg ou .webp',
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `Arquivo muito grande (${sizeMB} MB). O tamanho máximo é 1 MB`,
    }
  }

  return { valid: true }
}

// ─── Validação Server-Side (Mock) ──────────────────────────────────────────────

/**
 * Simula validação do logo no servidor antes de persistir.
 * Recebe a string Base64 e re-calcula o tamanho aproximado.
 *
 * @param {string} base64String — Data URL (data:image/...;base64,...)
 * @returns {Promise<{ valid: boolean, error?: string }>}
 */
export const validateLogoOnServer = (base64String) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!base64String) {
        return resolve({ valid: false, error: 'Nenhuma imagem fornecida' })
      }

      const commaIndex = base64String.indexOf(',')
      const rawBase64 = commaIndex !== -1 ? base64String.slice(commaIndex + 1) : base64String
      const approximateBytes = Math.ceil((rawBase64.length * 3) / 4)

      if (approximateBytes > MAX_FILE_SIZE_BYTES) {
        return resolve({
          valid: false,
          error: 'O servidor rejeitou o arquivo: tamanho excede 1 MB',
        })
      }

      resolve({ valid: true })
    }, 150)
  })
}

// ─── Utilitários ───────────────────────────────────────────────────────────────

/**
 * Converte um File em string Base64 (Data URL) via FileReader.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo'))
    reader.readAsDataURL(file)
  })
}

/**
 * Mock: simula persistência das configurações no servidor.
 *
 * @param {object} settings
 * @returns {Promise<{ success: boolean, data: object }>}
 */
export const saveTenantSettings = (settings) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data: settings })
    }, 250)
  })
}
