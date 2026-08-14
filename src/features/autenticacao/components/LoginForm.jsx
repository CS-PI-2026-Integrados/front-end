import { Link } from 'react-router-dom'
import { FieldGroup } from '@/shared/ui/field'
import { Button } from '@/shared/ui/button'
import { AuthSubmitButton } from '@/features/autenticacao/components/AuthSubmitButton'
import { CpfField } from '@/shared/ui/form-fields/CpfField'
import { PasswordField } from '@/features/autenticacao/components/PasswordField'
import { useLogin } from '@/features/autenticacao/hooks/useLogin'

export function LoginForm() {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    },
    signIn,
  } = useLogin()

  return (
    <form className="space-y-6" onSubmit={handleSubmit(signIn)}>
      <FieldGroup className="gap-1 p-0">
        <CpfField
          variant="auth"
          registration={register('cpf')}
          disabled={isSubmitting}
          error={errors.cpf?.message || errors.root?.message}
        />

        <PasswordField
          variant="auth"
          registration={register('password')}
          disabled={isSubmitting}
          error={errors.password?.message || errors.root?.message}
          labelAction={
            <Button asChild variant="link" className="mt-2 h-auto text-emerald-200">
              <Link
                to="/recuperar-senha"
                className="text-sm text-emerald-600 hover:text-emerald-800"
              >
                Esqueci minha senha
              </Link>
            </Button>
          }
        />

        <AuthSubmitButton disabled={!isValid} isLoading={isSubmitting}>
          Entrar
        </AuthSubmitButton>
      </FieldGroup>
    </form>
  )
}
