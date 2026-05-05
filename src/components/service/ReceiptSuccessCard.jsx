import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { CheckCircle2, Download, Eye, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export function ReceiptSuccessCard({ className, apenado, onReset }) {
  return (
    <Card
      className={cn(
        'border-primary/20 flex flex-col overflow-hidden rounded-xl shadow-sm',
        className
      )}
    >
      <CardHeader className="shrink-0 flex-col items-start space-y-1 px-4 pt-3 pb-1 md:px-6 md:pt-4 md:pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-primary h-5 w-5" />
          <CardTitle className="text-lg font-semibold md:text-xl">Atendimento Finalizado</CardTitle>
        </div>
        <p className="text-muted-foreground text-sm">Comprovante de presença gerado com sucesso</p>
      </CardHeader>
    </Card>
  )
}
