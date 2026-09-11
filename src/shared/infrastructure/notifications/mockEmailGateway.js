export async function sendPasswordResetEmail(email, token) {
  // eslint-disable-next-line no-console
  console.log(`[MOCK EMAIL] Para: ${email} | Link: /definir-senha?token=${token}`)
}

export async function sendWelcomeEmail(email, temporaryPassword) {
  // eslint-disable-next-line no-console
  console.log(
    `[MOCK EMAIL] Para: ${email} | Assunto: Bem-vindo ao SICAPE | Senha temporária: ${temporaryPassword}`
  )
}
