import { Spinner } from '@/shared/components/ui/spinner'

export function QuickSearchStates({ hasQuery, isLoading, error, isEmpty }) {
  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
        <Spinner /> Buscando...
      </div>
    )
  }

  if (error) {
    return <p className="text-destructive py-6 text-center text-sm">{error}</p>
  }

  if (isEmpty) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">Nenhuma pessoa encontrada.</p>
    )
  }

  if (!hasQuery) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        Digite um nome ou CPF para buscar.
      </p>
    )
  }

  return null
}
