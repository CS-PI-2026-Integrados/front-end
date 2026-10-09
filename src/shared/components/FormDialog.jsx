import { useRef } from 'react'
import { Loader2, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  isSubmitting = false,
  isProcessing = false,
  submitLabel = 'Salvar',
  error,
  children,
}) {
  const returnFocus = useRef(null)
  const changeOpen = (next) => {
    if (!isSubmitting) onOpenChange(next)
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl"
        onOpenAutoFocus={(event) => {
          returnFocus.current = document.activeElement
          const input = event.currentTarget.querySelector(
            'input:not([type="hidden"]):not([type="file"]):not([disabled]), textarea:not([disabled]), [role="combobox"]:not([disabled])'
          )
          if (input) {
            event.preventDefault()
            input.focus()
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          if (returnFocus.current?.isConnected) returnFocus.current.focus()
        }}
      >
        <form
          noValidate
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DialogHeader className="shrink-0 flex-row items-start justify-between gap-4 px-6 py-4 text-left">
            <div>
              <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={isSubmitting}
              onClick={() => changeOpen(false)}
              className="hover:bg-muted text-foreground shrink-0"
            >
              <X />
              <span className="sr-only">Fechar modal</span>
            </Button>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-left">
            <fieldset
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="m-0 min-w-0 border-0 p-0"
            >
              {children}
            </fieldset>
          </div>
          <div className="border-border mt-auto flex shrink-0 flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center">
            <div className="flex h-9 min-w-0 flex-1 items-center text-left">
              {error && (
                <p
                  role="alert"
                  className="text-destructive max-h-9 overflow-y-auto text-xs leading-snug"
                >
                  {error}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => changeOpen(false)}
                className="rounded-lg px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isProcessing || isSubmitting}
                className="rounded-lg px-5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
