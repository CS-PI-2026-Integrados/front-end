export const sendPasswordResetEmail = async (email, token) => {
  // eslint-disable-next-line no-console
  console.log(`[MOCK EMAIL] Para: ${email} | Link: /redefinir-senha?token=${token}`)
}

export const enviarEmailRecuperacao = async (email) => {
  // eslint-disable-next-line no-console
  console.log(`[MOCK EMAIL] Para: ${email} | Assunto: Bem-vindo ao SICAPE`)
}
