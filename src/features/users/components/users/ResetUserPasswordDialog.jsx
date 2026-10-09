import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'

export function ResetUserPasswordDialog({ onConfirm, onOpenChange, open, user, error }) {
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [localError, setLocalError] = useState(null)
  const pending = useRef(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const handleOpenChange = (nextOpen) => {
    if (pending.current) return
    if (!nextOpen) {
      setTemporaryPassword('')
      setIsCopied(false)
      setLocalError(null)
    }

    onOpenChange(nextOpen)
  }

  const handleConfirm = async () => {
    if (pending.current) return
    pending.current = true
    setIsSubmitting(true)
    setLocalError(null)

    try {
      const password = await onConfirm()
      if (mounted.current) setTemporaryPassword(password)
    } catch (cause) {
      if (mounted.current && cause.name !== 'AbortError')
        setLocalError(cause.message || 'Não foi possível redefinir a senha.')
    } finally {
      pending.current = false
      if (mounted.current) setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      if (mounted.current) setIsCopied(true)
    } catch {
      if (mounted.current)
        setLocalError('Não foi possível copiar. Selecione e copie a senha manualmente.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isSubmitting}>
        {(localError || error) && (
          <p role="alert" className="text-destructive text-sm">
            {localError || error}
          </p>
        )}
        {temporaryPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Nova senha gerada</DialogTitle>
              <DialogDescription>Esta senha não será exibida novamente.</DialogDescription>
            </DialogHeader>

            <div className="flex gap-2">
              <Input
                readOnly
                value={temporaryPassword}
                aria-label="Nova senha"
                className="font-mono"
              />
              <Button type="button" variant="outline" onClick={handleCopy}>
                {isCopied ? <Check /> : <Copy />}
                {isCopied ? 'Copiada' : 'Copiar'}
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Redefinir senha</DialogTitle>
              <DialogDescription>
                Deseja redefinir a senha de {user?.name}? Uma nova senha será gerada e exibida uma
                única vez.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="button" disabled={isSubmitting} onClick={handleConfirm}>
                {isSubmitting ? 'Redefinindo...' : 'Gerar nova senha'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
