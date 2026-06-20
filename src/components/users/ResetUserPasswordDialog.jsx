import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ResetUserPasswordDialog({ onConfirm, onOpenChange, open, user }) {
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setTemporaryPassword('')
      setIsCopied(false)
    }

    onOpenChange(nextOpen)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)

    try {
      setTemporaryPassword(await onConfirm())
    } catch {
      return
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(temporaryPassword)
    setIsCopied(true)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {temporaryPassword ? (
          <>
            <DialogHeader>
              <DialogTitle>Senha temporária gerada</DialogTitle>
              <DialogDescription>Esta senha não será exibida novamente.</DialogDescription>
            </DialogHeader>

            <div className="flex gap-2">
              <Input
                readOnly
                value={temporaryPassword}
                aria-label="Senha temporária"
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
                Deseja redefinir a senha de {user?.name}? Uma senha temporária será gerada e exibida
                uma única vez.
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
                Gerar senha temporária
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
