import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { useDistrictData } from '@/hooks/useDistrictData.js'
import { Button } from '@/components/ui/button.jsx'
import { ChevronLeft, ChevronRight, Eye, Download } from 'lucide-react'
import { ProofViewModal } from './ProofViewModal.jsx'
import { downloadReceiptPDF } from '@/lib/pdfService.js'

export function ProofHistory() {
  const { presencas, apenados } = useDistrictData()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedComprovante, setSelectedComprovante] = useState(null)

  const comprovantes = useMemo(() => {
    return [...presencas].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
  }, [presencas])

  const totalPages = Math.ceil(comprovantes.length / itemsPerPage)
  const comprovantesPage = comprovantes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDownload = (comp) => {
    const apenado = apenados.find((a) => a.id === comp.apenadoId)
    const processo = apenado?.processos?.find((p) => p.id === comp.processoId) || null

    downloadReceiptPDF({
      apenado: apenado || { fullName: comp.apenadoName, cpf: comp.cpf },
      processo,
      recibo: {
        photoUrl: comp.photoUrl,
        verificationCode: comp.verificationCode,
        dateTime: comp.dateTime,
      },
      mudancasDetectadas: comp.mudancasRastreadas || {},
    })
  }

  const handleView = (comp) => {
    setSelectedComprovante(comp)
    setModalOpen(true)
  }

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden rounded-xl shadow-sm md:flex-1">
      <CardHeader className="flex flex-col space-y-1 px-4 pt-3 pb-2 md:px-6 md:pt-4 md:pb-3">
        <CardTitle className="text-lg font-semibold md:text-xl">
          Histórico de Comprovantes Emitidos
        </CardTitle>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-muted-foreground flex-1 text-sm">
            Visualize todos os comprovantes emitidos anteriormente
          </p>
          <div className="flex items-center gap-2 self-start sm:self-auto">
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
              {currentPage} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-transparent"
              onClick={() => setCurrentPage((p) => Math.min(Math.max(1, totalPages), p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-[360px] min-w-0 flex-col p-0">
        {comprovantes.length > 0 ? (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card sticky top-0 z-10">
                <tr className="text-muted-foreground border-b">
                  <th className="h-12 px-4 text-left align-middle font-medium">Data/Hora</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Apenado</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">CPF</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Código</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Operador</th>
                  <th className="h-12 px-4 text-center align-middle font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {comprovantesPage.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
                  >
                    <td className="p-4 align-middle">
                      {new Date(comp.dateTime).toLocaleDateString('pt-BR')},{' '}
                      {new Date(comp.dateTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="text-foreground p-4 align-middle font-medium">
                      {comp.apenadoName}
                    </td>
                    <td className="text-foreground p-4 align-middle">{comp.cpf}</td>
                    <td className="p-4 align-middle">
                      <span className="bg-muted text-muted-foreground inline-flex items-center rounded px-2 py-1 font-mono text-xs font-medium">
                        {comp.verificationCode}
                      </span>
                    </td>
                    <td className="text-muted-foreground p-4 align-middle">{comp.operatorName}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(comp)}
                          className="h-8 px-2 md:px-3"
                        >
                          <Eye className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">Visualizar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(comp)}
                          className="h-8 px-2 md:px-3"
                        >
                          <Download className="h-4 w-4 md:mr-2" />
                          <span className="hidden md:inline">PDF</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <p>Nenhum comprovante gerado ainda.</p>
          </div>
        )}
      </CardContent>

      <ProofViewModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        comprovante={selectedComprovante}
      />
    </Card>
  )
}
