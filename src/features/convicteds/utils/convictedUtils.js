export const situacoesTrabalhistas = {
  registrado: 'registrado',
  informal: 'informal',
  naoTrabalha: 'naoTrabalha',
}

export function rotuloSituacaoApenado(situacao) {
  return situacao === 'inativo' ? 'Inativo' : 'Ativo'
}

export function rotuloSituacaoTrabalhista(situacao) {
  return (
    {
      registrado: 'Trabalho Registrado',
      informal: 'Trabalho Informal',
      naoTrabalha: 'Não Trabalha',
    }[situacao] ?? 'Não Trabalha'
  )
}

export function parsearEndereco(endereco) {
  if (!endereco) return {}
  const partes = endereco.split(/[,\-\u2013]/).map((p) => p.trim())
  if (partes.length >= 4) {
    const logradouro = partes[0] || ''
    const numero = partes[1] || ''
    const bairro = partes[2] || ''
    const cidadeUf = partes[3] || ''
    const ufMatch = cidadeUf.match(/\b([A-Z]{2})$/)
    const uf = ufMatch ? ufMatch[1] : ''
    const cidade = uf ? cidadeUf.replace(uf, '').trim().replace(/\s*$/, '') : cidadeUf
    return { logradouro, numero, bairro, cidade, uf }
  }
  return { logradouro: endereco }
}

export function montarEnderecoStr(form) {
  const parts = [form.logradouro, form.numero].filter(Boolean).join(', ')
  const rest = [form.bairro, form.cidade].filter(Boolean).join(', ')
  const full = [parts, rest].filter(Boolean).join(' - ')
  return form.uf ? `${full} - ${form.uf}` : full
}

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
