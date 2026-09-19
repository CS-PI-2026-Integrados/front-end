import { Loader2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'

export function AuthSubmitButton({ children, disabled, isLoading, className }) {
  return (
    <Button
      type="submit"
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : undefined}
      className={cn(
        'mt-3 flex h-13 w-full items-center justify-center rounded-[8px] px-3 py-4 text-lg font-medium text-white transition-all',
        disabled || isLoading
          ? 'cursor-not-allowed bg-gray-400 opacity-70'
          : 'bg-primary cursor-pointer hover:ring-emerald-700',
        className
      )}
    >
      {isLoading ? <Loader2 className="animate-spin text-white" size={24} /> : children}
    </Button>
  )
}
