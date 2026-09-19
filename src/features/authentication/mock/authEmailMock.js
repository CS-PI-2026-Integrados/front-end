export const sendPasswordResetEmail = async (email, token) => {
  // eslint-disable-next-line no-console
  console.log(`[MOCK EMAIL] Para: ${email} | Link: /definir-senha?token=${token}`)
}

export const sendWelcomeEmail = async (email, temporaryPassword) => {
  // eslint-disable-next-line no-console
  console.log(
    `[MOCK EMAIL] Para: ${email} | Assunto: Bem-vindo ao SICAPE | Senha temporária: ${temporaryPassword}`
  )
}
