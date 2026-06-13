export const sendPasswordResetEmail = async (email, token) => {
  localStorage.setItem(
    '@sicape:last-password-reset-email',
    JSON.stringify({
      email,
      link: `/redefinir-senha?token=${token}`,
      sentAt: new Date().toISOString(),
    })
  )
}
