import { Link } from 'react-router-dom'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { AuthFeedbackMessage } from '@/components/auth/AuthFeedbackMessage'
import { AuthSubmitButton } from '@/components/auth/AuthSubmitButton'
import { CpfField } from '@/components/auth/fields/CpfField'
import { useRecoverPassword } from '@/hooks/useRecoverPassword'

export function RecoverPasswordForm() {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    },
    feedbackMessage,
    requestResetLink,
  } = useRecoverPassword()

  return (
    <form className="space-y-6" onSubmit={handleSubmit(requestResetLink)}>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-700">Recuperar senha</h1>
      </div>

      <FieldGroup className="gap-1 p-0">
        <CpfField
          registration={register('cpf')}
          disabled={isSubmitting}
          error={errors.cpf?.message}
        />

        {feedbackMessage && <AuthFeedbackMessage>{feedbackMessage}</AuthFeedbackMessage>}

        <AuthSubmitButton disabled={!isValid} isLoading={isSubmitting}>
          Enviar link
        </AuthSubmitButton>

        <Button asChild variant="link" className="mt-2 h-auto text-emerald-200">
          <Link to="/login" className="text-sm text-emerald-600 hover:text-emerald-800">
            Voltar para login
          </Link>
        </Button>
      </FieldGroup>
    </form>
  )
}
