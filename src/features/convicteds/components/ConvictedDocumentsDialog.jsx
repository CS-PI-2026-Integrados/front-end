import { useMemo, useState } from 'react'

import { listarComprovantes } from '@/features/attendance'
import { downloadReceiptPDF, viewReceiptPDF } from '@/features/attendance/services/pdfService.js'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'

function formatarDataHora(data) {
  try {
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return data || ''
  }
}

export function ApenadoDocumentsDialog({ apenado, onOpenChange }) {
  const [aba, setAba] = useState('comprovantes')
  const comprovantes = useMemo(
    () =>
      apenado
        ? listarComprovantes(apenado.tenantId || apenado.tenant_id).filter(
            (item) => String(item.apenadoId) === String(apenado.id)
          )
        : [],
    [apenado]
  )
  if (!apenado) return null

  return (
    <Dialog open={Boolean(apenado)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{apenado.nomeCompleto || apenado.nome}</DialogTitle>
          <p className="text-muted-foreground text-sm">CPF: {apenado.cpf}</p>
        </DialogHeader>
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList>
            <TabsTrigger value="comprovantes">Comprovantes ({comprovantes.length})</TabsTrigger>
            <TabsTrigger value="certificados">Certificados (0)</TabsTrigger>
          </TabsList>
          <TabsContent value="comprovantes" className="mt-4">
            {comprovantes.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                Nenhum comprovante encontrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-2">Data/hora</th>
                      <th className="p-2">Código</th>
                      <th className="p-2">Operador</th>
                      <th className="p-2">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprovantes.map((comprovante) => {
                      const proc = (apenado.processos || []).find(
                        (p) => String(p.id) === String(comprovante.processoId)
                      ) || { numeroProcesso: comprovante.processoId || '' }

                      return (
                        <tr key={comprovante.id} className="border-b">
                          <td className="p-2">
                            {formatarDataHora(comprovante.emitidoEm || comprovante.dateTime)}
                          </td>
                          <td className="p-2 font-mono text-xs">
                            {comprovante.codigoVerificacao || comprovante.verificationCode}
                          </td>
                          <td className="p-2">
                            {comprovante.nomeOperador || comprovante.operatorName || 'Admin User'}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  viewReceiptPDF({
                                    apenado,
                                    processo: proc,
                                    recibo: comprovante,
                                  })
                                }
                              >
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  downloadReceiptPDF({
                                    apenado,
                                    processo: proc,
                                    recibo: comprovante,
                                  })
                                }
                              >
                                Baixar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          <TabsContent
            value="certificados"
            className="text-muted-foreground py-10 text-center text-sm"
          >
            Nenhum certificado encontrado.
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
