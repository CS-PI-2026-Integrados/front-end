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

export function ApenadoDocumentsDialog({
  person,
  comprovantes = [],
  termosGrupos = [],
  certificados = [],
  isLoading = false,
  error = null,
  onDownload,
  onOpenChange,
  onView,
}) {
  if (!person) return null

  const nome = person.convictedName || comprovantes[0]?.convictedName || 'Apenado'
  const cpf = person.convictedCpf || comprovantes[0]?.convictedCpf || '—'

  return (
    <Dialog open={Boolean(person)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{nome}</DialogTitle>
          <p className="text-muted-foreground text-sm">CPF: {cpf}</p>
        </DialogHeader>
        <Tabs defaultValue="comprovantes">
          <TabsList>
            <TabsTrigger value="comprovantes">Comprovantes ({comprovantes.length})</TabsTrigger>
            <TabsTrigger value="grupos">Termos de grupos ({termosGrupos.length})</TabsTrigger>
            {certificados.length > 0 && (
              <TabsTrigger value="certificados">Certificados ({certificados.length})</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="comprovantes" className="mt-4">
            {isLoading ? (
              <p role="status" className="text-muted-foreground py-10 text-center text-sm">
                Carregando comprovantes...
              </p>
            ) : error ? (
              <p role="alert" className="text-destructive py-10 text-center text-sm">
                {error}
              </p>
            ) : comprovantes.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                Nenhum comprovante encontrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow className="border-b text-left">
                      <TableHead className="p-2">Data/hora</TableHead>
                      <TableHead className="p-2">Protocolo</TableHead>
                      <TableHead className="p-2">Operador</TableHead>
                      <TableHead className="p-2">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comprovantes.map((comprovante) => (
                      <TableRow key={comprovante.id} className="border-b">
                        <TableCell className="p-2">
                          {formatarDataHora(comprovante.issuedAt || comprovante.createdAt)}
                        </TableCell>
                        <TableCell className="p-2 font-mono text-xs">
                          {comprovante.verificationCode}
                        </TableCell>
                        <TableCell className="p-2">{comprovante.operatorName || '—'}</TableCell>
                        <TableCell className="p-2">
                          <div className="flex items-center gap-1.5">
                            {onView && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onView(comprovante)}
                              >
                                Ver
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!onDownload}
                              onClick={() => onDownload?.(comprovante)}
                            >
                              Baixar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grupos" className="mt-4">
            {termosGrupos.length === 0 ? (
              <p className="text-muted-foreground py-10 text-center text-sm">
                Documentos de grupos reflexivos indisponíveis até haver suporte da API.
              </p>
            ) : (
              <ul className="divide-border divide-y">
                {termosGrupos.map((termo) => (
                  <li key={termo.id} className="py-2 text-sm">
                    {termo.groupName || termo.nomeGrupo || 'Termo de grupo'}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {certificados.length > 0 && (
            <TabsContent value="certificados" className="mt-4">
              <ul className="divide-border divide-y">
                {certificados.map((certificado) => (
                  <li key={certificado.id} className="py-2 text-sm">
                    {certificado.name || certificado.nome || 'Certificado'}
                  </li>
                ))}
              </ul>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
