import { Link } from 'react-router-dom'
import { FieldGroup } from '@/shared/components/ui/field'
import { Button } from '@/shared/components/ui/button'
import { AuthSubmitButton } from '@/features/authentication/components/AuthSubmitButton'
import { PasswordField } from '@/features/authentication/components/PasswordField'
import { PasswordStrengthMeter } from '@/features/authentication/components/PasswordStrengthMeter'

export function DefinePasswordForm({
  form,
  newPassword,
  definePassword,
  onBack,
  submitLabel = 'Salvar nova senha',
  title = 'Definir senha',
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = form

  return (
    <form className="space-y-6" onSubmit={handleSubmit(definePassword)}>
      <h1 className="text-foreground text-2xl font-bold">{title}</h1>

      <FieldGroup className="gap-1 p-0">
        <div className="space-y-2">
          <PasswordField
            variant="auth"
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
          variant="auth"
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
