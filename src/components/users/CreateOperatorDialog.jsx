import { Controller } from 'react-hook-form'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { InputField } from '@/components/form-fields/InputField'
import { CpfField } from '@/components/form-fields/CpfField'
import { ROLE_KEYS } from '@/lib/userPermissions'
import { useCreateOperatorForm } from '@/hooks/useCreateOperatorForm'

const fieldStyles = {
  className: 'h-9',
  errorClassName: 'min-h-4 text-xs',
  fieldClassName: 'gap-1',
  inputWrapperClassName: 'mt-0',
  labelClassName: 'text-sm font-medium',
}

export function CreateOperatorDialog({ onCreate, onOpenChange, open }) {
  const {
    form: {
      control,
      formState: { errors, isSubmitting, isValid },
      handleSubmit,
      register,
    },
    handleOpenChange,
    submitOperator,
  } = useCreateOperatorForm({ onCreate, onOpenChange })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-xl p-0 sm:max-w-2xl"
      >
        <form
          noValidate
          onSubmit={handleSubmit(submitOperator)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogHeader className="flex-row items-start justify-between gap-4 px-6 py-4 text-left">
            <div>
              <DialogTitle className="text-lg font-bold">Novo Usuário</DialogTitle>
              <DialogDescription className="mt-1">
                Cadastre um novo usuário para acessar o sistema da comarca
              </DialogDescription>
            </div>

            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isSubmitting}
                className="hover:bg-muted text-foreground shrink-0"
              >
                <X />
                <span className="sr-only">Fechar modal</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 text-left">
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InputField
                  id="operator-name"
                  label={
                    <>
                      Nome completo <span className="text-destructive">*</span>
                    </>
                  }
                  placeholder="Nome e sobrenome"
                  disabled={isSubmitting}
                  error={errors.name?.message}
                  registration={register('name')}
                  {...fieldStyles}
                />
              </div>

              <CpfField
                id="operator-cpf"
                label={
                  <>
                    CPF <span className="text-destructive">*</span>
                  </>
                }
                variant="default"
                registration={register('cpf')}
                disabled={isSubmitting}
                error={errors.cpf?.message}
                {...fieldStyles}
              />

              <InputField
                id="operator-email"
                type="email"
                label={
                  <>
                    E-mail de recuperação <span className="text-destructive">*</span>
                  </>
                }
                placeholder="usuario@comarca.gov.br"
                disabled={isSubmitting}
                error={errors.email?.message}
                registration={register('email')}
                {...fieldStyles}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-3">
              <Controller
                control={control}
                name="roleKey"
                render={({ field }) => (
                  <Field className="gap-1 sm:col-span-2">
                    <FieldLabel htmlFor="operator-role" className="text-sm font-medium">
                      Nível de acesso <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      onOpenChange={(isOpen) => {
                        if (!isOpen) field.onBlur()
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        id="operator-role"
                        aria-invalid={errors.roleKey ? true : undefined}
                        className="w-full"
                      >
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ROLE_KEYS.OPERATOR}>Operador</SelectItem>
                        <SelectItem value={ROLE_KEYS.ADMIN}>Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError className="min-h-5 text-xs">
                      {errors.roleKey?.message || ' '}
                    </FieldError>
                  </Field>
                )}
              />
            </div>

            {errors.root?.message && (
              <p role="alert" className="text-destructive mt-4 text-sm">
                {errors.root.message}
              </p>
            )}
          </div>

          <div className="border-border mt-auto flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              className="rounded-lg px-5"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting} className="rounded-lg px-5">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
