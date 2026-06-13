import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { formatCpf } from '@/lib/validadorCpf'

const initialForm = {
  name: '',
  cpf: '',
  email: '',
}

export function CreateOperatorDialog({ onCreate, onOpenChange, open }) {
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await onCreate(form)
      setForm(initialForm)
      onOpenChange(false)
    } catch {
      // The caller owns the error toast.
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setForm(initialForm)
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Novo Operador</DialogTitle>
            <DialogDescription>Cadastre um novo acesso de operador na comarca.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operator-name">Nome completo</Label>
              <Input
                id="operator-name"
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator-cpf">CPF</Label>
              <Input
                id="operator-cpf"
                value={form.cpf}
                onChange={(event) => updateField('cpf', formatCpf(event.target.value))}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator-email">E-mail</Label>
              <Input
                id="operator-email"
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
