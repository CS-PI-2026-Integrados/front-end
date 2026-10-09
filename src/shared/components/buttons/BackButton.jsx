import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

export function BackButton({
  to,
  label = 'Voltar para listagem',
  className,
  variant = 'ghost',
  ...props
}) {
  const navigate = useNavigate()

  if (to) {
    return (
      <Button
        asChild
        type="button"
        variant={variant}
        size="sm"
        className={cn(
          'text-muted-foreground hover:text-foreground w-fit cursor-pointer gap-2',
          className
        )}
        {...props}
      >
        <Link to={to}>
          <ArrowLeft className="size-4" />
          {label}
        </Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={cn(
        'text-muted-foreground hover:text-foreground w-fit cursor-pointer gap-2',
        className
      )}
      onClick={() => navigate(-1)}
      {...props}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Button>
  )
}
