import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { CpfField } from '@/components/auth/CpfField'
import { PasswordField } from '@/components/auth/PasswordField'
import { useLogin } from '@/hooks/useLogin'

export function LoginForm() {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    },
    formatCpf,
    showPassword,
    togglePasswordVisibility,
    authError,
    signIn,
  } = useLogin()

  return (
    <form className="space-y-6" onSubmit={handleSubmit(signIn)}>
      <FieldGroup className="gap-1 p-0">
        <CpfField
          registration={register('cpf')}
          formatCpf={formatCpf}
          disabled={isSubmitting}
          error={errors.cpf?.message || authError}
        />

        <PasswordField
          registration={register('password')}
          showPassword={showPassword}
          onToggleVisibility={togglePasswordVisibility}
          disabled={isSubmitting}
          error={errors.password?.message || authError}
          labelAction={
            <Link to="/recuperar-senha" className="text-sm text-emerald-500 hover:text-emerald-700">
              Esqueci minha senha
            </Link>
          }
        />

        <Button
          type="submit"
          disabled={!isValid}
          className={`mt-3 flex h-13 w-full items-center justify-center rounded-[8px] px-3 py-4 text-lg font-medium text-white transition-all ${
            !isValid || isSubmitting
              ? 'cursor-not-allowed bg-gray-400 opacity-70'
              : 'bg-primary cursor-pointer hover:ring-emerald-700'
          } `}
        >
          {isSubmitting ? <Loader2 className="animate-spin text-white" size={24} /> : 'Entrar'}
        </Button>
      </FieldGroup>
    </form>
  )
}
