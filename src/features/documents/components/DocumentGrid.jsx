import { FileText, Image, Download } from 'lucide-react'
import { formatDateTime } from '@/shared/lib/formatDateTime'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'

export function DocumentGrid({ documents, getProcessNumber }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {documents.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="mb-3 flex items-start gap-3">
              <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                <FileText className="text-primary h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-foreground truncate font-semibold">{document.convictedName}</p>
                <p className="text-muted-foreground text-xs">{getProcessNumber(document)}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatDateTime(document.issuedAt)}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" className="flex-1" disabled>
                <Image className="mr-1.5 h-3.5 w-3.5" />
                Foto
              </Button>
              <Button type="button" variant="outline" size="sm" className="flex-1" disabled>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
