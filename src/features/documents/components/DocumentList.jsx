import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'

export function DocumentList({ columns, documents, renderRow }) {
  return (
    <Table className="min-w-225 table-fixed text-sm">
      <TableHeader>
        <TableRow className="bg-secondary border-y">
          {columns.map((column) => (
            <TableHead
              key={column}
              className="text-foreground px-4 py-3 text-left text-xs font-semibold last:w-32 last:text-right"
            >
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id} className="[&>td]:px-4 [&>td]:py-3.5">
            {renderRow(document)}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
