import { Link } from 'react-router-dom'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton'
import { CpfField } from '@/components/auth/fields/CpfField'
import { PasswordField } from '@/components/auth/fields/PasswordField'
import { useLogin } from '@/hooks/useLogin'

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
          registration={register('cpf')}
          disabled={isSubmitting}
          error={errors.cpf?.message || errors.root?.message}
        />

        <PasswordField
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
