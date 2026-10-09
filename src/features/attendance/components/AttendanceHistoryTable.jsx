import { Download, Eye, Image } from 'lucide-react'
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
}) {
  return (
    <Table contentColumns="max-content fit-content(28ch) max-content max-content fit-content(28ch) max-content">
      <TableHeader>
        <TableRow className="bg-secondary border-y">
          {['Data/Hora', 'Apenado', 'CPF', 'Código', 'Operador'].map((label) => (
            <TableHead
              key={label}
              className="text-foreground px-4 py-3 text-left text-xs font-semibold"
            >
              {label}
            </TableHead>
          ))}
          <TableHead className="text-foreground px-4 py-3 text-right text-xs font-semibold">
            Ações
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => (
          <TableRow key={record.id} className="hover:bg-muted/50 border-b transition-colors">
            <TableCell className="px-4 py-3.5">
              <span className="text-foreground text-sm">
                {new Date(record.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <span className="text-muted-foreground ml-1.5 text-xs">
                {new Date(record.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </TableCell>
            <TableCell
              className="min-w-40 px-4 py-3.5 font-medium wrap-anywhere whitespace-normal"
              title={record.convictedName}
            >
              {record.convictedName}
            </TableCell>
            <TableCell className="text-muted-foreground px-4 py-3.5">
              {record.convictedCpf}
            </TableCell>
            <TableCell className="px-4 py-3.5">
              <span
                className="bg-muted text-muted-foreground inline-block rounded-md px-2 py-0.5 align-middle font-mono text-xs font-medium"
                title={record.id}
              >
                {record.id}
              </span>
            </TableCell>
            <TableCell
              className="text-muted-foreground min-w-40 px-4 py-3.5 wrap-anywhere whitespace-normal"
              title={record.operatorName || 'Indisponível'}
            >
              {record.operatorName || 'Indisponível'}
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
                  onClick={() => onViewPdf?.(record)}
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Ver foto"
                  title="Ver foto"
                  disabled={!onViewPhoto}
                  onClick={() => onViewPhoto?.(record)}
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
                  onClick={() => onDownloadPdf?.(record)}
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
