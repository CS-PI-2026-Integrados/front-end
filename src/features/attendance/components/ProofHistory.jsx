import { useState, useMemo } from 'react'
import { useAtendimentoData } from '@/features/attendance/hooks/useAttendanceData.js'
import { Button } from '@/shared/components/ui/button.jsx'
import { ChevronLeft, ChevronRight, Eye, Download, FileText } from 'lucide-react'
import { useReceiptPdfActions } from '@/features/attendance/hooks/useReceiptPdfActions'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export function ProofHistory() {
  const { download, view } = useReceiptPdfActions()
  const { presencas, apenados } = useAtendimentoData()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const comprovantes = useMemo(() => {
    return [...presencas].sort(
      (a, b) => new Date(b.emitidoEm || b.dateTime) - new Date(a.emitidoEm || a.dateTime)
    )
  }, [presencas])

  const totalPages = Math.max(1, Math.ceil(comprovantes.length / itemsPerPage))
  const comprovantesPage = comprovantes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const buildAtendimento = (comp) => {
    const apenado = apenados.find((a) => String(a.id) === String(comp.apenadoId))
    const processo =
      apenado?.processos?.find((p) => String(p.id) === String(comp.processoId)) || null

    return {
      apenado: apenado || {
        id: comp.apenadoId,
        fullName: comp.nomeApenado || 'Apenado',
        cpf: comp.cpf || comp.cpfApenado || '',
      },
      processo: processo || (comp.processoId ? { processNumber: comp.processoId } : null),
      recibo: {
        photoUrl: comp.photoUrl,
        codigoVerificacao: comp.codigoVerificacao || comp.verificationCode,
        emitidoEm: comp.emitidoEm || comp.dateTime,
        nomeOperador: comp.nomeOperador || comp.operatorName || 'Administrador',
        configuracaoInstituicao: comp.configuracaoInstituicao,
      },
      mudancasDetectadas: comp.alteracoesRastreadas || {},
    }
  }

  const handleDownload = (comp) => {
    download(buildAtendimento(comp))
  }

  const handleView = (comp) => {
    view(buildAtendimento(comp))
  }

  return (
    <div className="bg-card text-card-foreground flex w-full flex-col rounded-xl border shadow-sm">
      <div className="shrink-0 px-5 pt-4 pb-3 md:px-6 md:pt-5 md:pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight md:text-xl">
              Histórico de Comprovantes Emitidos
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Visualize todos os comprovantes emitidos anteriormente
            </p>
          </div>
          {comprovantes.length > 0 && (
            <div className="flex shrink-0 items-center gap-1.5 self-start sm:self-auto">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-muted-foreground w-[72px] text-center text-sm font-medium tabular-nums">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-transparent"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {comprovantes.length > 0 ? (
          <>
            <div className="hidden flex-col md:flex">
              <div className="w-full overflow-auto">
                <Table className="text-sm">
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow className="border-b">
                      <TableHead className="h-10 px-6 text-left text-xs font-semibold whitespace-nowrap">
                        Data/Hora
                      </TableHead>
                      <TableHead className="h-10 px-6 text-left text-xs font-semibold whitespace-nowrap">
                        Apenado
                      </TableHead>
                      <TableHead className="h-10 px-6 text-left text-xs font-semibold whitespace-nowrap">
                        CPF
                      </TableHead>
                      <TableHead className="h-10 px-6 text-left text-xs font-semibold whitespace-nowrap">
                        Código
                      </TableHead>
                      <TableHead className="h-10 px-6 text-left text-xs font-semibold whitespace-nowrap">
                        Operador
                      </TableHead>
                      <TableHead className="h-10 px-6 text-center text-xs font-semibold whitespace-nowrap">
                        Ações
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprovantesPage.map((comp, idx) => (
                      <TableRow
                        key={comp.id}
                        className="hover:bg-muted/50 border-b transition-colors last:border-b-0"
                        style={{
                          animationDelay: `${idx * 30}ms`,
                        }}
                      >
                        <TableCell className="px-6 py-3.5 align-middle whitespace-nowrap">
                          <span className="text-foreground text-sm">
                            {new Date(comp.emitidoEm || comp.dateTime).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-muted-foreground ml-1.5 text-xs">
                            {new Date(comp.emitidoEm || comp.dateTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-3.5 align-middle">
                          <span className="text-foreground text-sm font-medium">
                            {comp.nomeApenado || 'Apenado'}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3.5 align-middle text-sm whitespace-nowrap">
                          {comp.cpf || comp.cpfApenado}
                        </TableCell>
                        <TableCell className="px-6 py-3.5 align-middle">
                          <span className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-medium">
                            {comp.codigoVerificacao || comp.verificationCode}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground px-6 py-3.5 align-middle text-sm">
                          {comp.nomeOperador || comp.operatorName || 'Administrador'}
                        </TableCell>
                        <TableCell className="px-6 py-3.5 align-middle">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(comp)}
                              className="h-8 gap-1.5 px-2.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              <span className="text-xs">Ver</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(comp)}
                              className="h-8 gap-1.5 px-2.5"
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span className="text-xs">PDF</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 pb-4 md:hidden">
              {comprovantesPage.map((comp, idx) => (
                <div
                  key={comp.id}
                  className="bg-muted/30 hover:bg-muted/60 flex flex-col gap-2 rounded-lg border p-3 transition-colors"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {comp.nomeApenado || 'Apenado'}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {comp.cpfApenado || comp.cpf}
                      </p>
                    </div>
                    <span className="bg-muted text-muted-foreground shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-medium">
                      {comp.codigoVerificacao || comp.verificationCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground text-xs">
                      <span>
                        {new Date(comp.emitidoEm || comp.dateTime).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="mx-1.5">•</span>
                      <span>
                        {new Date(comp.emitidoEm || comp.dateTime).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(comp)}
                        className="h-7 w-7"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(comp)}
                        className="h-7 w-7"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="bg-muted/50 flex h-16 w-16 items-center justify-center rounded-full">
              <FileText className="text-muted-foreground/60 h-8 w-8" />
            </div>
            <div>
              <p className="text-foreground text-sm font-medium">Nenhum comprovante gerado</p>
              <p className="mt-1 text-xs">Os comprovantes emitidos aparecerão aqui.</p>
            </div>
          </div>
        )}
      </div>

      {comprovantes.length > 0 && (
        <div className="text-muted-foreground shrink-0 border-t px-5 py-2.5 text-center text-xs md:px-6">
          Exibindo {comprovantesPage.length} de {comprovantes.length} comprovante
          {comprovantes.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
