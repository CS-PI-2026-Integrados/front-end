import { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card.jsx'

function formatarTempoRelativo(atividadesRecentes) {
  if (!atividadesRecentes || !Array.isArray(atividadesRecentes)) return []

  const agoraMs = Date.now()
  const umMinuto = 60 * 1000
  const umaHora = 60 * umMinuto
  const umDia = 24 * umaHora
  const umMes = 30 * umDia
  const umAno = 365 * umDia

  return atividadesRecentes.slice(0, 4).map((atividade) => {
    const ms = new Date(atividade.dateTime).getTime()
    const diferenca = agoraMs - ms
    let tempoRelativo = ''

    if (isNaN(ms) || ms > agoraMs) {
      tempoRelativo = 'Agora mesmo'
    } else if (diferenca < umaHora) {
      const literal = Math.max(0, Math.floor(diferenca / umMinuto))
      tempoRelativo = `${literal} min`
    } else if (diferenca < umDia) {
      const literal = Math.floor(diferenca / umaHora)
      tempoRelativo = `${literal} ${literal > 1 ? 'horas' : 'hora'}`
    } else if (diferenca < umMes) {
      const literal = Math.floor(diferenca / umDia)
      tempoRelativo = `${literal} ${literal > 1 ? 'dias' : 'dia'}`
    } else if (diferenca < umAno) {
      const literal = Math.floor(diferenca / umMes)
      tempoRelativo = `${literal} ${literal > 1 ? 'meses' : 'mês'}`
    } else {
      const literal = Math.floor(diferenca / umAno)
      tempoRelativo = `${literal} ${literal > 1 ? 'anos' : 'ano'}`
    }

    return tempoRelativo
  })
}

export function RecentActivities({ atividadesRecentes }) {
  const atividadesFormatadas = useMemo(() => {
    const tempos = formatarTempoRelativo(atividadesRecentes)

    return (atividadesRecentes || []).slice(0, 4).map((atividade, index) => ({
      ...atividade,
      tempoFormatado: tempos[index] || 'Agora mesmo',
    }))
  }, [atividadesRecentes])

  if (!atividadesRecentes || !Array.isArray(atividadesRecentes)) return null

  return (
    <Card className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0">
        <CardTitle className="font-bold">Atividades Recentes</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Últimos comprovantes emitidos no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pt-0">
        <div className="flex flex-col">
          {atividadesFormatadas.length > 0 ? (
            atividadesFormatadas.map((a, index) => (
              <div
                key={a.id || `activity-${index}`}
                className="border-border flex items-start gap-3 border-b py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="bg-primary mt-1.5 h-2 w-2 shrink-0 rounded-full"></div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm leading-none font-medium" title={a.apenadoName}>
                    {a.apenadoName}
                  </p>
                  <p className="text-muted-foreground truncate text-sm" title={a.verificationCode}>
                    Comprovante: {a.verificationCode}
                  </p>
                  <p className="text-muted-foreground text-xs">Há {a.tempoFormatado}</p>
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
