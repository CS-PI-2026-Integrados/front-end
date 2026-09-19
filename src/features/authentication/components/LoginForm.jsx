import { Link } from 'react-router-dom'
import { FieldGroup } from '@/shared/components/ui/field'
import { Button } from '@/shared/components/ui/button'
import { SubmitButton } from '@/shared/components/buttons/SubmitButton'
import { CpfField } from '@/shared/components/form-fields/CpfField'
import { PasswordField } from '@/shared/components/form-fields/PasswordField'
import { useLogin } from '@/features/authentication/hooks/useLogin'

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

        <SubmitButton
          className="mt-3 h-13 rounded-[8px] text-lg"
          disabled={!isValid}
          isLoading={isSubmitting}
        >
          Entrar
        </SubmitButton>
      </FieldGroup>
    </form>
  )
}
