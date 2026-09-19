import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

export function SubmitButton({
  children,
  className,
  isLoading = false,
  loadingLabel,
  disabled,
  ...props
}) {
  return (
    <Button
      type="submit"
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn('w-full', className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {loadingLabel || children}
        </>
      ) : (
        children
      )}
    </Button>
  )
}
