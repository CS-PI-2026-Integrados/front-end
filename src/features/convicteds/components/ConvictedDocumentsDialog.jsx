import { useMemo, useState } from 'react'

import { listarComprovantes } from '@/features/attendance'
import { useReceiptPdfActions } from '@/features/attendance'
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
  return new Date(data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function ApenadoDocumentsDialog({ apenado, onOpenChange }) {
  const { download } = useReceiptPdfActions()
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
                    {comprovantes.map((comprovante) => (
                      <TableRow key={comprovante.id} className="border-b">
                        <TableCell className="p-2">
                          {formatarDataHora(comprovante.emitidoEm)}
                        </TableCell>
                        <TableCell className="p-2 font-mono text-xs">
                          {comprovante.codigoVerificacao}
                        </TableCell>
                        <TableCell className="p-2">
                          {comprovante.nomeOperador || 'Admin User'}
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              download({
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
                        </TableCell>
                      </TableRow>
                    ))}
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
