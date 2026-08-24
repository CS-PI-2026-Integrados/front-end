import authBg from '@/features/authentication/assets/auth-bg.png'
import { AuthBackgroundLayout } from '@/features/authentication/components/AuthBackgroundLayout'
import { AuthFormCard } from '@/features/authentication/components/AuthFormCard'
import { RecoverPasswordForm } from '@/features/authentication/components/RecoverPasswordForm'

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
