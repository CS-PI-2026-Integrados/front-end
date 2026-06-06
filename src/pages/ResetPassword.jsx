import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import authBg from '@/assets/backgrounds/auth-bg.png'
import { AuthBackgroundLayout } from '@/components/auth/AuthBackgroundLayout'
import { AuthFormCard } from '@/components/auth/AuthFormCard'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { Button } from '@/components/ui/button'
import { useResetPassword } from '@/hooks/useResetPassword'

const ResetPassword = () => {
  const resetPasswordController = useResetPassword()
  const { tokenStatus } = resetPasswordController
  const isLoading = tokenStatus === 'loading'
  const isInvalid = tokenStatus === 'invalid'

  return (
    <AuthBackgroundLayout backgroundImage={authBg}>
      <div className="flex flex-1 items-center justify-center">
        <AuthFormCard>
          {isLoading && (
            <div className="flex min-h-60 items-center justify-center">
              <Loader2 className="animate-spin text-emerald-700" size={32} />
            </div>
          )}

          {isInvalid && (
            <div className="space-y-6 text-center">
              <h1 className="text-2xl font-semibold text-gray-700">Este link não é mais válido.</h1>

              <Button asChild className="h-13 w-full rounded-[8px] text-lg font-medium">
                <Link to="/recuperar-senha">Solicitar novo link</Link>
              </Button>
            </div>
          )}

          {!isLoading && !isInvalid && <ResetPasswordForm {...resetPasswordController} />}
        </AuthFormCard>
      </div>
    </AuthBackgroundLayout>
  )
}

export default ResetPassword
