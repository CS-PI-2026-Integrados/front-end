import logoWhite from '@/assets/logos/to-dark-background.svg'
import { cn } from '@/lib/utils'

export function AuthBackgroundLayout({ backgroundImage, children, className, contentClassName }) {
  return (
    <div
      className={cn('relative min-h-screen overflow-hidden bg-zinc-900 p-15 text-white', className)}
    >
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        className={cn('relative z-10 flex min-h-[calc(100vh-7.5rem)] flex-col', contentClassName)}
      >
        <img src={logoWhite} alt="Logo white" className="w-20" />
        {children}
      </div>
    </div>
  )
}
