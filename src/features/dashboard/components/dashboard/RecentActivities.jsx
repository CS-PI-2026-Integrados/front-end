import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/shared/components/ui/card.jsx'
import { formatRelativeTime } from '../../model/formatRelativeTime'

export function RecentActivities({ atividadesRecentes = [], isLoading = false, error = null }) {
  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="font-bold">Atividades Recentes</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Últimos atendimentos registrados na comarca
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0">
        <div className="flex flex-col">
          {isLoading ? (
            <p role="status" className="text-muted-foreground text-sm">
              Carregando atividades recentes...
            </p>
          ) : error ? (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          ) : atividadesRecentes.length > 0 ? (
            atividadesRecentes.map((a) => (
              <div
                key={a.id}
                className="border-border flex items-start gap-3 border-b py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"></div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm leading-none font-medium" title={a.convictedName}>
                    {a.convictedName}
                  </p>
                  <p className="text-muted-foreground truncate text-sm" title={a.id}>
                    Atendimento: {a.id}
                  </p>
                  <p className="text-muted-foreground text-xs">{formatRelativeTime(a.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-sm">Nenhuma atividade registrada.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
