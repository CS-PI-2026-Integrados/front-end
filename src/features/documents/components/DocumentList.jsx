import { Image, Download } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { Button } from '@/shared/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

export function DocumentList({ documents, getProcessNumber }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Processo</TableHead>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Operador</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell className="font-medium">{document.convictedName}</TableCell>
            <TableCell>{getProcessNumber(document)}</TableCell>
            <TableCell>{formatDateTime(document.issuedAt)}</TableCell>
            <TableCell>{document.operatorName || '—'}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label="Ver foto" disabled>
                  <Image className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label="Baixar PDF" disabled>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
