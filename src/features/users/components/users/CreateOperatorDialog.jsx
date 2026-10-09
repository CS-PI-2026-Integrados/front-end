import { Controller } from 'react-hook-form'
import { FormDialog } from '@/shared/components/FormDialog'
import { FormGrid, FormSection } from '@/shared/components/FormSection'
import { InputField } from '@/shared/components/form-fields/InputField'
import { CpfField } from '@/shared/components/form-fields/CpfField'
import { SelectField } from '@/shared/components/form-fields/SelectField'
import { ROLE_KEYS } from '@/features/users/utils/userPermissionsUtils'
import { useCreateOperatorForm } from '@/features/users/hooks/useCreateOperatorForm'

const roleOptions = [
  { value: ROLE_KEYS.OPERATOR, label: 'Operador' },
  { value: ROLE_KEYS.ADMIN, label: 'Administrador' },
]

export function CreateOperatorDialog({ onCreate, onOpenChange, open }) {
  const { form, error, handleOpenChange, submitOperator } = useCreateOperatorForm({
    onCreate,
    onOpenChange,
    open,
  })
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form
  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Novo Usuário"
      description="Cadastre um novo usuário para acessar o sistema da comarca"
      onSubmit={handleSubmit(submitOperator)}
      isSubmitting={isSubmitting}
      error={error}
    >
      <FormSection title="Dados do usuário" first>
        <FormGrid>
          <div className="sm:col-span-2">
            <InputField
              id="operator-name"
              label="Nome completo"
              required
              variant="modal"
              placeholder="Nome e sobrenome"
              disabled={isSubmitting}
              error={errors.name?.message}
              registration={register('name')}
            />
          </div>
          <CpfField
            id="operator-cpf"
            label="CPF"
            required
            variant="modal"
            registration={register('cpf')}
            disabled={isSubmitting}
            error={errors.cpf?.message}
          />
          <InputField
            id="operator-email"
            type="email"
            label="E-mail de recuperação"
            required
            variant="modal"
            placeholder="usuario@comarca.gov.br"
            disabled={isSubmitting}
            error={errors.email?.message}
            registration={register('email')}
          />
        </FormGrid>
        <Controller
          control={control}
          name="roleKey"
          render={({ field }) => (
            <SelectField
              id="operator-role"
              label="Nível de acesso"
              required
              variant="modal"
              field={field}
              options={roleOptions}
              placeholder="Selecione o nível"
              disabled={isSubmitting}
              error={errors.roleKey?.message}
            />
          )}
        />
      </FormSection>
      <FormSection title="Acesso ao sistema">
        <InputField
          id="operator-password"
          type="password"
          autoComplete="new-password"
          label="Senha inicial"
          required
          variant="modal"
          description="Use no mínimo 8 caracteres, incluindo letras e números. Informe a senha ao usuário após o cadastro."
          disabled={isSubmitting}
          error={errors.password?.message}
          registration={register('password')}
        />
      </FormSection>
    </FormDialog>
  )
}
