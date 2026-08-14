import authBg from '@/assets/backgrounds/auth-bg.png'
import { AuthBackgroundLayout } from '@/features/autenticacao/components/AuthBackgroundLayout'
import { AuthFormCard } from '@/features/autenticacao/components/AuthFormCard'
import { RecoverPasswordForm } from '@/features/autenticacao/components/RecoverPasswordForm'

const RecoverPassword = () => {
  return (
    <AuthBackgroundLayout backgroundImage={authBg}>
      <div className="flex flex-1 items-center justify-center">
        <AuthFormCard>
          <RecoverPasswordForm />
        </AuthFormCard>
      </div>
    </AuthBackgroundLayout>
  )
}

export default RecoverPassword
