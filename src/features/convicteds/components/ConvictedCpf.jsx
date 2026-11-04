import { useId } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useSession } from '@/features/authentication'
import { Button } from '@/shared/components/ui/button'
import { formatCpf } from '@/shared/lib/cpf'
import { cn } from '@/shared/lib/utils'
import { useConvictedCpf } from '../hooks/useConvictedCpf'

function CpfDisplay({ convictedId, maskedCpf, disabled }) {
  const { cpf, isLoading, error, reveal, hide } = useConvictedCpf(convictedId)
  const errorId = useId()
  const actionLabel = isLoading ? 'Carregando CPF…' : cpf ? 'Ocultar CPF' : 'Visualizar CPF'
  return (
    <div className="space-y-1">
      <div className="inline-flex items-center gap-1">
        <p className="text-muted-foreground text-sm whitespace-nowrap">
          CPF: {cpf ? formatCpf(cpf) : maskedCpf}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={actionLabel}
          title={actionLabel}
          disabled={isLoading || (!cpf && disabled)}
          aria-busy={isLoading}
          aria-expanded={Boolean(cpf)}
          aria-describedby={error ? errorId : undefined}
          onClick={cpf ? hide : reveal}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : cpf ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-destructive text-xs">
          {error}
        </p>
      )}
    </div>
  )
}

export function ConvictedCpf({ convictedId, maskedCpf, disabled = false, className }) {
  const { session } = useSession()
  const userId = session?.user?.id
  const tenantId = session?.tenant?.id
  // Remount before rendering a different identity; old results cannot flash or be reused.
  const key = JSON.stringify([userId, tenantId, convictedId, maskedCpf])
  return (
    <div className={cn('text-sm', className)}>
      <CpfDisplay
        key={key}
        convictedId={convictedId}
        maskedCpf={maskedCpf}
        disabled={disabled || !convictedId || !userId || !tenantId}
      />
    </div>
  )
}
