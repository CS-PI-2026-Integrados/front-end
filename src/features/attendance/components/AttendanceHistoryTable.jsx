import { Download, Eye, Image, Loader2 } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from '@/shared/components/ui/table'

export function AttendanceHistoryTable({
  records,
  onViewPdf,
  onViewPhoto,
  onDownloadPdf,
  isProcessing = false,
  pdfFeedback,
  compact = false,
}) {
  return (
    <Table
      contentColumns={
        compact
          ? 'max-content minmax(8rem, 1fr) max-content max-content'
          : 'max-content fit-content(24ch) max-content max-content max-content max-content max-content'
      }
    >
      <TableHeader>
        <TableRow className="bg-secondary border-y">
          {(compact
            ? ['Data/Hora', 'Documento', 'PDF']
            : ['Data/Hora', 'Apenado', 'CPF', 'Código', 'Processo', 'PDF']
          ).map((label) => (
            <TableHead key={label} className="text-foreground px-4 py-3 text-xs font-semibold">
              {label}
            </TableHead>
          ))}
          <TableHead className="text-foreground px-4 py-3 text-xs font-semibold">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => {
          const feedback = pdfFeedback?.recordId === record.id ? pdfFeedback : null
          const receiptStatus =
            typeof record.receiptIssued === 'boolean'
              ? record.receiptIssued
                ? 'Emitido'
                : 'Não emitido'
              : 'Não informado'
          return (
            <TableRow key={record.id} className="hover:bg-muted/50 border-b transition-colors">
              <TableCell className="px-4 py-3.5">
                <span className="text-foreground text-sm">
                  {new Date(record.createdAt).toLocaleDateString('pt-BR', {
                    timeZone: 'America/Sao_Paulo',
                  })}
                </span>
                <span className={`text-muted-foreground text-xs ${compact ? 'block' : 'ml-1.5'}`}>
                  {new Date(record.createdAt).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo',
                  })}
                </span>
              </TableCell>
              {!compact && (
                <TableCell
                  className="min-w-28 px-4 py-3.5 font-medium wrap-anywhere whitespace-normal"
                  title={record.convictedName}
                >
                  {record.convictedName}
                </TableCell>
              )}
              {!compact && (
                <TableCell className="text-muted-foreground px-4 py-3.5">
                  {record.convictedCpf}
                </TableCell>
              )}
              <TableCell className="px-4 py-3.5 whitespace-normal">
                <span
                  className="bg-muted text-muted-foreground inline-block rounded-md px-2 py-0.5 align-middle font-mono text-xs font-medium break-all"
                  title={record.id}
                >
                  {record.id}
                </span>
                {compact && (
                  <p className="text-muted-foreground mt-1 text-xs break-all">
                    Processo: {record.processNumber || 'Não informado'}
                  </p>
                )}
              </TableCell>
              {!compact && (
                <TableCell className="text-muted-foreground px-4 py-3.5">
                  {record.processNumber || 'Indisponível'}
                </TableCell>
              )}
              <TableCell className="px-4 py-3.5">
                <Badge variant={record.receiptIssued === true ? 'secondary' : 'outline'}>
                  {receiptStatus}
                </Badge>
              </TableCell>
              <TableCell className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Visualizar PDF"
                    title="Visualizar PDF"
                    disabled={isProcessing || !onViewPdf}
                    aria-busy={(isProcessing && feedback?.action === 'view') || undefined}
                    onClick={() => onViewPdf?.(record)}
                  >
                    {isProcessing && feedback?.action === 'view' ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ver foto"
                    title={record.photoAvailable === false ? 'Foto indisponível' : 'Ver foto'}
                    disabled={!onViewPhoto || record.photoAvailable === false}
                    onClick={(event) => onViewPhoto?.(record, event.currentTarget)}
                  >
                    <Image className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Baixar PDF"
                    title="Baixar PDF"
                    disabled={isProcessing || !onDownloadPdf}
                    aria-busy={(isProcessing && feedback?.action === 'download') || undefined}
                    onClick={() => onDownloadPdf?.(record)}
                  >
                    {isProcessing && feedback?.action === 'download' ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {feedback?.error && (
                  <p
                    role="alert"
                    className="text-destructive mt-1 max-w-48 text-xs whitespace-normal"
                  >
                    {feedback.action === 'view' ? 'Visualizar PDF' : 'Baixar PDF'}
                    {' — '}
                    {feedback.error}
                  </p>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
