import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CircleHelp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CpfField } from '@/components/auth/fields/CpfField'
import { PasswordField } from '@/components/auth/fields/PasswordField'
import { PasswordStrengthMeter } from '@/components/auth/fields/PasswordStrengthMeter'
import { ROLE_KEYS } from '@/lib/userPermissions'
import { createUserSchema } from '@/schemas/userSchemas'

const defaultValues = {
  name: '',
  cpf: '',
  email: '',
  roleKey: ROLE_KEYS.OPERATOR,
  password: '',
  confirmPassword: '',
}

const compactFieldProps = {
  className:
    'text-foreground h-9 rounded-md border px-2.5 py-1 text-sm placeholder:text-muted-foreground',
  errorClassName: 'min-h-4 text-xs',
  fieldClassName: 'gap-1',
  labelClassName: 'text-sm font-medium text-foreground',
}

export function CreateOperatorDialog({ onCreate, onOpenChange, open }) {
  const {
    clearErrors,
    control,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(createUserSchema),
  })
  const password = useWatch({
    control,
    name: 'password',
  })

  const handleServerError = (error) => {
    const message = error?.message || 'Houve um erro ao completar essa ação.'

    if (message.includes('CPF já cadastrado')) {
      setError('cpf', { type: 'server', message })
      return
    }

    if (message.includes('E-mail')) {
      setError('email', { type: 'server', message })
      return
    }

    if (message.includes('nível') || message.includes('Nível') || message.includes('Cargo')) {
      setError('roleKey', { type: 'server', message })
      return
    }

    setError('root', { type: 'server', message })
  }

  const handleCreate = async (data) => {
    clearErrors('root')

    try {
      await onCreate(data)
      reset(defaultValues)
      onOpenChange(false)
    } catch (error) {
      handleServerError(error)
    }
  }

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      reset(defaultValues)
      clearErrors()
    }

    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form noValidate onSubmit={handleSubmit(handleCreate)} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Novo Operador</DialogTitle>
            <DialogDescription>
              Cadastre um novo servidor para acessar o sistema da comarca.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Field className="gap-1">
              <FieldLabel htmlFor="operator-name" className="text-sm font-medium">
                <RequiredLabel>Nome Completo</RequiredLabel>
              </FieldLabel>
              <Input
                id="operator-name"
                placeholder="Ex: Maria Aparecida da Silva"
                aria-invalid={errors.name ? true : undefined}
                disabled={isSubmitting}
                {...register('name')}
              />
              <FieldError className="min-h-4 text-xs">
                {errors.name?.message || <span className="invisible">placeholder</span>}
              </FieldError>
            </Field>

            <CpfField
              id="operator-cpf"
              label={<RequiredLabel>CPF</RequiredLabel>}
              registration={register('cpf')}
              disabled={isSubmitting}
              error={errors.cpf?.message}
              {...compactFieldProps}
            />

            <Field className="gap-1">
              <FieldLabel htmlFor="operator-email" className="text-sm font-medium">
                <RequiredLabel>
                  E-mail de Recuperação
                  <span
                    title="Usado para recuperação de acesso"
                    aria-label="Usado para recuperação de acesso"
                    className="text-muted-foreground inline-flex"
                  >
                    <CircleHelp className="size-3.5" />
                  </span>
                </RequiredLabel>
              </FieldLabel>
              <Input
                id="operator-email"
                type="email"
                placeholder="usuario@comarca.gov.br"
                aria-invalid={errors.email ? true : undefined}
                disabled={isSubmitting}
                {...register('email')}
              />
              <FieldError className="min-h-4 text-xs">{errors.email?.message}</FieldError>
            </Field>

            <Controller
              control={control}
              name="roleKey"
              render={({ field }) => (
                <Field className="gap-1">
                  <FieldLabel htmlFor="operator-role" className="text-sm font-medium">
                    <RequiredLabel>Nível de Acesso</RequiredLabel>
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
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
                  <FieldError className="min-h-4 text-xs">{errors.roleKey?.message}</FieldError>
                </Field>
              )}
            />

            <div className="space-y-1">
              <PasswordField
                id="operator-password"
                label={<RequiredLabel>Senha</RequiredLabel>}
                registration={register('password')}
                disabled={isSubmitting}
                error={errors.password?.message}
                placeholder="Digite a senha"
                {...compactFieldProps}
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <PasswordField
              id="operator-confirm-password"
              label={<RequiredLabel>Confirmar Senha</RequiredLabel>}
              registration={register('confirmPassword')}
              disabled={isSubmitting}
              error={errors.confirmPassword?.message}
              placeholder="Confirme a senha"
              {...compactFieldProps}
            />

            {errors.root?.message && (
              <p role="alert" className="text-destructive text-sm">
                {errors.root.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
