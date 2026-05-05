import { Card, CardContent } from '@/components/ui/card.jsx'
import { cn } from '@/lib/utils.js'

export function ReceiptSuccessCard({ className, apenado, onReset }) {
  return (
    <Card className={cn('flex flex-col items-center justify-center p-6', className)}>
      <CardContent>Estado de Sucesso (Em construção...)</CardContent>
    </Card>
  )
}
