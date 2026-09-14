import { useRef } from 'react'
import { IMaskInput } from 'react-imask'
import { Loader2, Search, Upload, X } from 'lucide-react'

import { useConvictedForm } from '@/features/convicteds/hooks/useConvictedForm'
import { EMPLOYMENT_STATUS_OPTIONS } from '@/features/convicteds/utils/convictedUtils'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Separator } from '@/shared/components/ui/separator'

export function ConvictedFormDialog({ open, onOpenChange, convicted = null, onSuccess }) {
  const isEditing = Boolean(convicted?.id)

  const { form, errors, preview, fileRef, isSubmitting, isSearchingCep, actions } =
    useConvictedForm(convicted, {
      onSuccess: (result) => {
        onSuccess?.(result)
        onOpenChange?.(false)
      },
    })

  const {
    handleChange,
    handleSelect,
    handleMask,
    handleAddressChange,
    handleFoto,
    removerFoto,
    buscarCep,
    submit,
  } = actions

  const getInputClass = (field) =>
    `w-full rounded-md border px-2.5 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none bg-transparent placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3 ${
      errors[field]
        ? 'border-destructive ring-destructive/20 ring-3'
        : 'border-input dark:bg-input/30'
    }`

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    await submit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl"
      >
        <DialogHeader className="flex-row items-start justify-between gap-4 px-6 py-4 text-left">
          <div>
            <DialogTitle className="text-lg font-bold">
              {isEditing ? 'Editar Apenado' : 'Cadastrar Novo Apenado'}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {isEditing
                ? 'Atualize as informações do apenado no formulário abaixo'
                : 'Preencha os dados do apenado no formulário abaixo'}
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-left">
            <div className="mb-6">
              <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
                Foto de Reconhecimento {!isEditing && <span className="text-destructive">*</span>}
              </p>

              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`hover:bg-muted flex h-24 w-24 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                      errors.photo
                        ? 'border-destructive bg-destructive/10'
                        : 'border-muted-foreground/30 bg-muted/40'
                    }`}
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt="Foto de reconhecimento"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <>
                        <Upload className="text-muted-foreground size-5" />
                        <span className="text-muted-foreground mt-1 text-[10px] font-medium">
                          Upload
                        </span>
                      </>
                    )}
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFoto}
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <p className="text-muted-foreground text-xs">
                    Envie uma foto frontal nítida para reconhecimento facial. Formatos aceitos: JPG,
                    PNG ou WEBP (máx. 5 MB).
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => fileRef.current?.click()}
                    >
                      {preview ? 'Alterar foto' : 'Selecionar foto'}
                    </Button>
                    {preview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        className="text-destructive hover:text-destructive"
                        onClick={removerFoto}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  {errors.photo && (
                    <p className="text-destructive text-xs font-medium">{errors.photo}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="mb-6 space-y-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Dados Pessoais
              </p>

              <div>
                <Label htmlFor="convicted-name">
                  Nome Completo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="convicted-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nome completo do apenado"
                  className={errors.name ? 'border-destructive ring-destructive/20 ring-3' : ''}
                />
                {errors.name && <p className="text-destructive mt-1 text-xs">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="convicted-cpf">
                    CPF <span className="text-destructive">*</span>
                  </Label>
                  <IMaskInput
                    id="convicted-cpf"
                    mask="000.000.000-00"
                    value={form.cpf}
                    unmask={false}
                    onAccept={(val) => handleMask('cpf', val)}
                    placeholder="000.000.000-00"
                    className={getInputClass('cpf')}
                  />
                  {errors.cpf && <p className="text-destructive mt-1 text-xs">{errors.cpf}</p>}
                </div>

                <div>
                  <Label htmlFor="convicted-birthDate">
                    Data de Nascimento <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="convicted-birthDate"
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    className={
                      errors.birthDate ? 'border-destructive ring-destructive/20 ring-3' : ''
                    }
                  />
                  {errors.birthDate && (
                    <p className="text-destructive mt-1 text-xs">{errors.birthDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="convicted-phone">
                    Telefone de Contato <span className="text-destructive">*</span>
                  </Label>
                  <IMaskInput
                    id="convicted-phone"
                    mask={
                      form.phone?.replace(/\D/g, '').length > 10
                        ? '(00) 00000-0000'
                        : '(00) 0000-0000'
                    }
                    value={form.phone}
                    unmask={false}
                    onAccept={(val) => handleMask('phone', val)}
                    placeholder="(00) 00000-0000"
                    className={getInputClass('phone')}
                  />
                  {errors.phone && <p className="text-destructive mt-1 text-xs">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="convicted-employmentStatus">
                    Situação Trabalhista <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={form.employmentStatus || ''}
                    onValueChange={(val) => handleSelect('employmentStatus', val)}
                  >
                    <SelectTrigger
                      id="convicted-employmentStatus"
                      className={
                        errors.employmentStatus
                          ? 'border-destructive ring-destructive/20 ring-3'
                          : ''
                      }
                    >
                      <SelectValue placeholder="Selecione a situação..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employmentStatus && (
                    <p className="text-destructive mt-1 text-xs">{errors.employmentStatus}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator className="mb-6" />

            <div className="space-y-4">
              <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                Endereço
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <Label htmlFor="convicted-cep">CEP</Label>
                  <div className="flex gap-1.5">
                    <IMaskInput
                      id="convicted-cep"
                      mask="00000-000"
                      value={form.address?.zipCode || ''}
                      unmask={false}
                      onAccept={(val) => handleAddressChange('zipCode', val)}
                      placeholder="00000-000"
                      className={getInputClass('address.zipCode')}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isSearchingCep}
                      onClick={buscarCep}
                      title="Buscar CEP"
                      className="shrink-0"
                    >
                      {isSearchingCep ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Search className="size-4" />
                      )}
                      <span className="sr-only">Buscar CEP</span>
                    </Button>
                  </div>
                  {errors['address.zipCode'] && (
                    <p className="text-destructive mt-1 text-xs">{errors['address.zipCode']}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="convicted-street">
                    Logradouro <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="convicted-street"
                    value={form.address?.street || ''}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="Rua, avenida, etc."
                    className={
                      errors['address.street']
                        ? 'border-destructive ring-destructive/20 ring-3'
                        : ''
                    }
                  />
                  {errors['address.street'] && (
                    <p className="text-destructive mt-1 text-xs">{errors['address.street']}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="convicted-number">
                    Número <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="convicted-number"
                    value={form.address?.number || ''}
                    onChange={(e) => handleAddressChange('number', e.target.value)}
                    placeholder="123"
                    className={
                      errors['address.number']
                        ? 'border-destructive ring-destructive/20 ring-3'
                        : ''
                    }
                  />
                  {errors['address.number'] && (
                    <p className="text-destructive mt-1 text-xs">{errors['address.number']}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="convicted-complement">Complemento</Label>
                  <Input
                    id="convicted-complement"
                    value={form.address?.complement || ''}
                    onChange={(e) => handleAddressChange('complement', e.target.value)}
                    placeholder="Apto, Bloco (opcional)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="convicted-neighborhood">
                    Bairro <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="convicted-neighborhood"
                    value={form.address?.neighborhood || ''}
                    onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                    placeholder="Bairro"
                    className={
                      errors['address.neighborhood']
                        ? 'border-destructive ring-destructive/20 ring-3'
                        : ''
                    }
                  />
                  {errors['address.neighborhood'] && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors['address.neighborhood']}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="convicted-city">
                    Cidade <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="convicted-city"
                    value={form.address?.city || ''}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Cidade"
                    className={
                      errors['address.city'] ? 'border-destructive ring-destructive/20 ring-3' : ''
                    }
                  />
                  {errors['address.city'] && (
                    <p className="text-destructive mt-1 text-xs">{errors['address.city']}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="convicted-state">
                    UF <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="convicted-state"
                    maxLength={2}
                    value={form.address?.state || ''}
                    onChange={(e) => handleAddressChange('state', e.target.value.toUpperCase())}
                    placeholder="MS"
                    className={
                      errors['address.state'] ? 'border-destructive ring-destructive/20 ring-3' : ''
                    }
                  />
                  {errors['address.state'] && (
                    <p className="text-destructive mt-1 text-xs">{errors['address.state']}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                'Salvar alterações'
              ) : (
                'Cadastrar apenado'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Aliases para manter compatibilidade com eventuais imports legados
export const ApenadoCreateDialog = ConvictedFormDialog
export const ApenadoEditDialog = ConvictedFormDialog
