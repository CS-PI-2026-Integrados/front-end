import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'

export function DocumentList({ columns, documents, renderRow }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>{renderRow(document)}</TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
