import { Link } from 'react-router-dom'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton'
import { PasswordField } from '@/components/auth/fields/PasswordField'
import { PasswordStrengthMeter } from '@/components/auth/fields/PasswordStrengthMeter'

export function ResetPasswordForm({
  form,
  newPassword,
  redefinePassword,
  onBack,
  submitLabel = 'Redefinir',
  title = 'Redefinir senha',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form

  return (
    <form className="space-y-6" onSubmit={handleSubmit(redefinePassword)}>
      <h1 className="text-2xl font-semibold text-gray-700">{title}</h1>

      <FieldGroup className="gap-1 p-0">
        <div className="space-y-2">
          <PasswordField
            id="newPassword"
            label="Nova Senha"
            registration={register('newPassword', { deps: ['confirmPassword'] })}
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
          disabled={isSubmitting}
          error={errors.confirmPassword?.message}
          placeholder="Digite sua senha"
        />

        <AuthSubmitButton disabled={!isValid} isLoading={isSubmitting}>
          {submitLabel}
        </AuthSubmitButton>

        {errors.root?.message && (
          <p role="alert" className="text-sm text-red-500">
            {errors.root.message}
          </p>
        )}

        {onBack ? (
          <Button
            type="button"
            variant="link"
            className="mt-2 h-auto text-sm text-emerald-600 hover:text-emerald-800"
            onClick={onBack}
          >
            Voltar para login
          </Button>
        ) : (
          <Button asChild variant="link" className="mt-2 h-auto text-emerald-200">
            <Link to="/login" className="text-sm text-emerald-600 hover:text-emerald-800">
              Voltar para login
            </Link>
          </Button>
        )}
      </FieldGroup>
    </form>
  )
}
