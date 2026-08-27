import { useMemo, useState } from 'react'

import { listarComprovantes, useReceiptPdfActions } from '@/features/attendance'
import { Button } from '@/shared/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

function formatarDataHora(data) {
  try {
    return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return data || ''
  }
}

export function ApenadoDocumentsDialog({ apenado, onOpenChange }) {
  const { download, view } = useReceiptPdfActions()
  const [aba, setAba] = useState('comprovantes')
  const comprovantes = useMemo(
    () =>
      apenado
        ? listarComprovantes(apenado.tenantId).filter(
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
          <DialogTitle>{apenado.fullName}</DialogTitle>
          <p className="text-muted-foreground text-sm">CPF: {apenado.cpf}</p>
        </DialogHeader>
        <Tabs value={aba} onOpenChange={setAba} valueChange={setAba}>
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
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow className="border-b text-left">
                      <TableHead className="p-2">Data/hora</TableHead>
                      <TableHead className="p-2">Código</TableHead>
                      <TableHead className="p-2">Operador</TableHead>
                      <TableHead className="p-2">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprovantes.map((comprovante) => {
                      const proc = (apenado.processos || []).find(
                        (p) => String(p.id) === String(comprovante.processoId)
                      ) || { processNumber: comprovante.processoId || '' }

                      return (
                        <TableRow key={comprovante.id} className="border-b">
                          <TableCell className="p-2">
                            {formatarDataHora(comprovante.emitidoEm || comprovante.dateTime)}
                          </TableCell>
                          <TableCell className="p-2 font-mono text-xs">
                            {comprovante.codigoVerificacao || comprovante.verificationCode}
                          </TableCell>
                          <TableCell className="p-2">
                            {comprovante.nomeOperador || comprovante.operatorName || 'Admin User'}
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex items-center gap-1.5">
                              {view && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    view({
                                      apenado,
                                      processo: proc,
                                      recibo: comprovante,
                                    })
                                  }
                                >
                                  Ver
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  download({
                                    apenado,
                                    processo: proc,
                                    recibo: comprovante,
                                  })
                                }
                              >
                                Baixar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
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
