import logo from '@/assets/logos/to-light-background.svg'
import logoWhite from '@/assets/logos/to-dark-background.svg'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

export function AuthBackgroundLayout({
  backgroundImage,
  children,
  className,
  contentClassName,
  overlayClassName,
}) {
  const { isDarkMode } = useTheme()

  return (
    <div
      className={cn(
        'bg-background text-foreground relative min-h-screen overflow-hidden p-15 dark:bg-zinc-950 dark:text-white',
        className
      )}
    >
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        className={cn(
          'absolute inset-0 bg-lime-900/10 bg-linear-to-b dark:bg-lime-900/20',
          overlayClassName
        )}
      />

      <div
        className={cn('relative z-10 flex min-h-[calc(100vh-7.5rem)] flex-col', contentClassName)}
      >
        <img src={isDarkMode ? logoWhite : logo} alt="Logo" className="w-20" />
        {children}
      </div>
    </div>
  )
}
