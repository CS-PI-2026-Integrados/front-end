import authBg from '@/assets/backgrounds/auth-bg.png'
import { AuthBackgroundLayout } from '@/components/auth/AuthBackgroundLayout'
import { AuthFormCard } from '@/components/auth/AuthFormCard'
import { RecoverPasswordForm } from '@/components/auth/RecoverPasswordForm'

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
