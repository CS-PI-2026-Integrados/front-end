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
import { AuthInputField } from '@/components/auth/fields/AuthInputField'
import { CpfField } from '@/components/auth/fields/CpfField'
import { PasswordField } from '@/components/auth/fields/PasswordField'
import { PasswordStrengthMeter } from '@/components/auth/fields/PasswordStrengthMeter'
import { ROLE_KEYS } from '@/lib/userPermissions'
import { useCreateOperatorForm } from '@/hooks/useCreateOperatorForm'

const fieldStyles = {
  className:
    'h-10 rounded-lg border border-gray-300 bg-background px-3 py-2 text-sm text-foreground shadow-none focus-visible:border-primary focus-visible:ring-primary/30',
  errorClassName: 'min-h-4 text-xs',
  fieldClassName: 'gap-1',
  inputWrapperClassName: 'mt-0',
  labelClassName: 'text-xs font-semibold text-gray-600',
}

export function CreateOperatorDialog({ currentUser, onCreate, onOpenChange, open }) {
  const {
    form: {
      control,
      formState: { errors, isSubmitting, isValid },
      handleSubmit,
      register,
    },
    handleOpenChange,
    password,
    submitOperator,
  } = useCreateOperatorForm({ onCreate, onOpenChange })
  const canCreateAdmin = currentUser?.role?.key === ROLE_KEYS.OWNER

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
          <DialogHeader className="bg-primary flex-row items-start justify-between gap-4 px-6 py-4 text-left">
            <div>
              <DialogTitle className="text-lg font-bold text-white">
                Cadastrar Novo Operador
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/80 mt-1">
                Preencha os dados do servidor no formulário abaixo
              </DialogDescription>
            </div>

            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isSubmitting}
                className="shrink-0 text-white hover:bg-white/10 hover:text-white"
              >
                <X />
                <span className="sr-only">Fechar modal</span>
              </Button>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5 text-left">
            <SectionTitle>Identificação do servidor</SectionTitle>

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <AuthInputField
                  id="operator-name"
                  label={<RequiredLabel>Nome completo</RequiredLabel>}
                  placeholder="Nome e sobrenome"
                  disabled={isSubmitting}
                  error={errors.name?.message}
                  registration={register('name')}
                  {...fieldStyles}
                />
              </div>

              <CpfField
                id="operator-cpf"
                label={<RequiredLabel>CPF</RequiredLabel>}
                registration={register('cpf')}
                disabled={isSubmitting}
                error={errors.cpf?.message}
                {...fieldStyles}
              />

              <AuthInputField
                id="operator-email"
                type="email"
                label={<RequiredLabel>E-mail de recuperação</RequiredLabel>}
                placeholder="usuario@comarca.gov.br"
                disabled={isSubmitting}
                error={errors.email?.message}
                registration={register('email')}
                {...fieldStyles}
              />
            </div>

            <SectionTitle>Acesso ao sistema</SectionTitle>

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
              <Controller
                control={control}
                name="roleKey"
                render={({ field }) => (
                  <Field className="gap-1 sm:col-span-2">
                    <FieldLabel
                      htmlFor="operator-role"
                      className="text-xs font-semibold text-gray-600"
                    >
                      <RequiredLabel>Nível de acesso</RequiredLabel>
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
                        className="focus-visible:border-primary focus-visible:ring-primary/30 h-10 w-full rounded-lg border-gray-300 shadow-none"
                      >
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ROLE_KEYS.OPERATOR}>Operador</SelectItem>
                        {canCreateAdmin && (
                          <SelectItem value={ROLE_KEYS.ADMIN}>Administrador</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FieldError className="min-h-5 text-xs">
                      {errors.roleKey?.message || ' '}
                    </FieldError>
                  </Field>
                )}
              />

              <div>
                <PasswordField
                  id="operator-password"
                  label={<RequiredLabel>Senha</RequiredLabel>}
                  registration={register('password', { deps: ['confirmPassword'] })}
                  disabled={isSubmitting}
                  error={errors.password?.message}
                  placeholder="Digite a senha"
                  {...fieldStyles}
                />
                <PasswordStrengthMeter password={password} />
              </div>

              <PasswordField
                id="operator-confirm-password"
                label={<RequiredLabel>Confirmar senha</RequiredLabel>}
                registration={register('confirmPassword')}
                disabled={isSubmitting}
                error={errors.confirmPassword?.message}
                placeholder="Confirme a senha"
                {...fieldStyles}
              />
            </div>

            {errors.root?.message && (
              <p role="alert" className="text-destructive mt-4 text-sm">
                {errors.root.message}
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-400">* campos obrigatórios</p>
            <div className="flex justify-end gap-3">
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function SectionTitle({ children, className = '' }) {
  return (
    <p
      className={`mb-3 text-xs font-semibold tracking-widest text-gray-400 uppercase ${className}`}
    >
      {children}
    </p>
  )
}

function RequiredLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-1">
      {children}
      <span className="text-destructive">*</span>
    </span>
  )
}
