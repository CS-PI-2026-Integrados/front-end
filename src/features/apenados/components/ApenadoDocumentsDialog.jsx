import { useMemo, useState } from 'react'

import { listarComprovantes } from '@/features/atendimento'
import { downloadReceiptPDF } from '@/features/atendimento/services/pdfService.js'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

function formatarDataHora(data) {
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ApenadoDocumentsDialog({ apenado, onOpenChange }) {
  const [aba, setAba] = useState('comprovantes')
  const comprovantes = useMemo(
    () =>
      apenado
        ? listarComprovantes(apenado.tenantId).filter((item) => item.apenadoId === apenado.id)
        : [],
    [apenado]
  )
  if (!apenado) return null

  return (
    <Dialog open={Boolean(apenado)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{apenado.nomeCompleto}</DialogTitle>
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
                    {comprovantes.map((comprovante) => (
                      <tr key={comprovante.id} className="border-b">
                        <td className="p-2">{formatarDataHora(comprovante.emitidoEm)}</td>
                        <td className="p-2 font-mono text-xs">{comprovante.codigoVerificacao}</td>
                        <td className="p-2">{comprovante.nomeOperador || 'Admin User'}</td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              downloadReceiptPDF({
                                apenado,
                                processo: apenado.processos.find(
                                  (processo) => processo.id === comprovante.processoId
                                ) || { numeroProcesso: comprovante.processoId },
                                recibo: comprovante,
                              })
                            }
                          >
                            Baixar
                          </Button>
                        </td>
                      </tr>
                    ))}
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
