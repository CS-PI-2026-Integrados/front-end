import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { useDistrictData } from '@/hooks/useDistrictData.js'

export function ProofHistory() {
  const { presencas } = useDistrictData()

  const comprovantes = presencas.map((p) => ({
    id: p.id,
    apenadoNome: p.apenadoName,
    apenadoCpf: p.cpf,
    codigoVerificacao: p.verificationCode,
    operador: p.operatorName,
    data: p.dateTime,
    url: p.pdfUrl,
  }))

  return (
    <Card className="w-full rounded-xl shadow-sm">
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-4 pt-3 pb-1 md:px-6 md:pt-4 md:pb-2">
        <CardTitle className="items-start text-lg font-semibold md:text-xl">
          Histórico de Comprovantes
        </CardTitle>
        <p className="text-muted-foreground text-sm">Veja os comprovantes gerados anteriormente</p>
      </CardHeader>
      <CardContent className="flex flex-col px-4 pb-4 md:min-h-0 md:flex-1 md:px-6 md:pb-6">
        {comprovantes && comprovantes.length > 0 ? (
          <ul className="divide-muted divide-y">
            {comprovantes.map((comp) => (
              <li key={comp.id} className="flex gap-2 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    {new Date(comp.data).toLocaleString()}
                  </span>
                  <span className="font-medium">{comp.apenadoNome}</span>
                </div>
                <a
                  href={comp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm hover:underline"
                >
                  Ver comprovante
                </a>
                <p className="text-muted-foreground text-sm">
                  Código de verificação: {comp.codigoVerificacao}
                </p>
                <p className="text-muted-foreground text-sm">Operador: {comp.operador}</p>
                <p className="text-muted-foreground text-sm">CPF: {comp.apenadoCpf}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-muted bg-muted flex h-full flex-col items-center justify-center gap-4 rounded-md border p-6 text-center">
            <p className="text-muted-foreground text-sm">Nenhum comprovante gerado ainda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
