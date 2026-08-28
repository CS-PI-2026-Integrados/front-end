import { Download } from 'lucide-react'
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
import { GroupDocumentTypeBadge } from './GroupDocumentTypeBadge'

export function GroupDocumentList({ documents, onOpenGroup }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Processo</TableHead>
          <TableHead>Grupo</TableHead>
          <TableHead>Tipo do Documento</TableHead>
          <TableHead>Data de Geração</TableHead>
          <TableHead>Ação</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell className="font-medium">{document.convictedName}</TableCell>
            <TableCell>{document.processNumber}</TableCell>
            <TableCell>
              <button
                type="button"
                onClick={() => onOpenGroup(document.groupId)}
                className="text-primary font-medium hover:underline"
              >
                {document.groupName}
              </button>
            </TableCell>
            <TableCell>
              <GroupDocumentTypeBadge type={document.type} />
            </TableCell>
            <TableCell>{formatDateTime(document.issuedAt)}</TableCell>
            <TableCell>
              <Button type="button" variant="ghost" size="icon" aria-label="Baixar PDF" disabled>
                <Download className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
