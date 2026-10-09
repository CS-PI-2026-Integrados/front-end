import { useId } from 'react'
import { Separator } from '@/shared/components/ui/separator'

export function FormSection({ title, children, first = false }) {
  const id = useId()
  return (
    <>
      {!first && <Separator className="mt-3 mb-5" />}
      <section aria-labelledby={id}>
        <h3 id={id} className="text-muted-foreground mb-3 text-xs font-semibold uppercase">
          {title}
        </h3>
        {children}
      </section>
    </>
  )
}
export function FormGrid({ children }) {
  return <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">{children}</div>
}
