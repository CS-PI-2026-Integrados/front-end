import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'
import { getConvictedStatusLabel } from '../utils/convictedUtils'

export function BackToConvicteds() {
  return (
    <Button asChild variant="ghost" className="w-fit">
      <Link to="/apenados">
        <ArrowLeft /> Voltar para listagem
      </Link>
    </Button>
  )
}

export function ConvictedProfileSummary({ convicted, photoUrl }) {
  const initials = (convicted.name || 'A').charAt(0).toUpperCase()

  return (
    <Card size="sm" className="justify-center">
      <CardContent className="flex flex-col items-center gap-3 px-4 text-center">
        <Avatar className="size-28">
          <AvatarImage src={photoUrl || undefined} alt={`Foto cadastral de ${convicted.name}`} />
          <AvatarFallback className="text-3xl">{initials}</AvatarFallback>
        </Avatar>
        <h1 className="text-foreground w-full text-xl font-semibold wrap-break-word">
          {convicted.name}
        </h1>
        <Badge variant="secondary">{getConvictedStatusLabel(convicted.status)}</Badge>
      </CardContent>
    </Card>
  )
}
