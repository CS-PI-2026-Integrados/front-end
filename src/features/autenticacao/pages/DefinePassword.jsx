import { Link } from 'react-router-dom'
import authBg from '@/assets/backgrounds/auth-bg.png'
import { AuthBackgroundLayout } from '@/features/autenticacao/components/AuthBackgroundLayout'
import { AuthFormCard } from '@/features/autenticacao/components/AuthFormCard'
import { DefinePasswordForm } from '@/features/autenticacao/components/DefinePasswordForm'
import { Button } from '@/shared/ui/button'
import { useDefinePassword } from '@/features/autenticacao/hooks/useDefinePassword'
import { RouteLoader } from '@/shared/ui/RouteLoader'

const DefinePassword = () => {
  const definePasswordController = useDefinePassword()
  const { isRequiredChangeFlow, status } = definePasswordController
  const isLoading = status === 'loading'
  const isInvalid = status === 'invalid'

  return (
    <AuthBackgroundLayout backgroundImage={authBg}>
      <div className="flex flex-1 items-center justify-center">
        <AuthFormCard>
          {isLoading && <RouteLoader className="min-h-60" />}
          {isInvalid && (
            <div className="space-y-6 text-center">
              <h1 className="text-2xl font-semibold text-gray-700">Este link não é mais válido.</h1>

              <Button asChild className="h-13 w-full rounded-[8px] text-lg font-medium">
                <Link to="/recuperar-senha">Solicitar novo link</Link>
              </Button>
            </div>
          )}
          {!isLoading && !isInvalid && (
            <DefinePasswordForm
              {...definePasswordController}
              title={isRequiredChangeFlow ? 'Defina uma nova senha' : 'Redefinir senha'}
              onBack={isRequiredChangeFlow ? definePasswordController.returnToLogin : undefined}
            />
          )}
        </AuthFormCard>
      </div>
    </AuthBackgroundLayout>
  )
}

export default DefinePassword
