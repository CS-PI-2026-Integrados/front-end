import { FileText } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { Card, CardContent } from '@/shared/components/ui/card'

export function DocumentGrid({ documents, renderMeta, renderActions }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="mb-3 flex items-start gap-3">
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-semibold">{document.convictedName}</p>
                <p className="text-muted-foreground text-xs">{document.processNumber}</p>
                {renderMeta?.(document)}
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatDateTime(document.issuedAt)}
                </p>
              </div>
            </div>
            {renderActions?.(document)}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
