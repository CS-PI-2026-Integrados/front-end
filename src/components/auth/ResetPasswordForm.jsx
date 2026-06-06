import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { PasswordField } from '@/components/auth/PasswordField'
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter'

export function ResetPasswordForm({
  form,
  newPassword,
  showNewPassword,
  showConfirmPassword,
  toggleNewPasswordVisibility,
  toggleConfirmPasswordVisibility,
  redefinePassword,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form

  return (
    <form className="space-y-6" onSubmit={handleSubmit(redefinePassword)}>
      <h1 className="text-2xl font-semibold text-gray-700">Redefinir senha</h1>

      <FieldGroup className="gap-1 p-0">
        <div className="space-y-2">
          <PasswordField
            id="newPassword"
            label="Nova Senha"
            registration={register('newPassword')}
            showPassword={showNewPassword}
            onToggleVisibility={toggleNewPasswordVisibility}
            disabled={isSubmitting}
            error={errors.newPassword?.message}
            placeholder="Digite sua senha"
          />

          <PasswordStrengthMeter password={newPassword} />
        </div>

        <PasswordField
          id="confirmPassword"
          label="Confirmar Senha"
          registration={register('confirmPassword')}
          showPassword={showConfirmPassword}
          onToggleVisibility={toggleConfirmPasswordVisibility}
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          placeholder="Digite sua senha"
        />

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`mt-3 flex h-13 w-full items-center justify-center rounded-[8px] px-3 py-4 text-lg font-medium text-white transition-all ${
            !isValid || isSubmitting
              ? 'cursor-not-allowed bg-gray-400 opacity-70'
              : 'bg-primary cursor-pointer hover:ring-emerald-700'
          } `}
        >
          {isSubmitting ? <Loader2 className="animate-spin text-white" size={24} /> : 'Redefinir'}
        </Button>

        <Button asChild variant="link" className="mt-2 h-auto text-emerald-200">
          <Link to="/login" className="text-sm text-emerald-600 hover:text-emerald-800">
            Voltar para login
          </Link>
        </Button>
      </FieldGroup>
    </form>
  )
}
