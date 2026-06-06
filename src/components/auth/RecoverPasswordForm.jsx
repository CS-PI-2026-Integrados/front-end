import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { CpfField } from '@/components/auth/CpfField'
import { useRecoverPassword } from '@/hooks/useRecoverPassword'

export function RecoverPasswordForm() {
  const {
    form: {
      register,
      handleSubmit,
      formState: { errors, isValid, isSubmitting },
    },
    formatCpf,
    successMessage,
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
          formatCpf={formatCpf}
          disabled={isSubmitting}
          error={errors.cpf?.message}
        />

        {successMessage && (
          <p className="rounded-[8px] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`mt-3 flex h-13 w-full items-center justify-center rounded-[8px] px-3 py-4 text-lg font-medium text-white transition-all ${
            !isValid || isSubmitting
              ? 'cursor-not-allowed bg-gray-400 opacity-70'
              : 'bg-primary cursor-pointer hover:ring-emerald-700'
          } `}
        >
          {isSubmitting ? <Loader2 className="animate-spin text-white" size={24} /> : 'Enviar link'}
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
