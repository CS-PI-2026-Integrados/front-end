import { Controller, get } from 'react-hook-form'
import { Loader2, Search } from 'lucide-react'
import { useConvictedForm } from '../hooks/useConvictedForm'
import { useConvictedPhoto } from '../hooks/useConvictedPhoto'
import { ProcessSelector } from './ProcessSelector'
import { FormDialog } from '@/shared/components/FormDialog'
import { FormSection, FormGrid } from '@/shared/components/FormSection'
import { InputField } from '@/shared/components/form-fields/InputField'
import { CpfField } from '@/shared/components/form-fields/CpfField'
import { SelectField } from '@/shared/components/form-fields/SelectField'
import { MaskedInputField } from '@/shared/components/form-fields/MaskedInputField'
import { ImageUploadField } from '@/shared/components/form-fields/ImageUploadField'
import { Button } from '@/shared/components/ui/button'
import { stateOptions } from '@/shared/utils/states'

const employmentOptions = [
  { value: 'FORMAL_WORK', label: 'Trabalho formal' },
  { value: 'INFORMAL_WORK', label: 'Trabalho informal' },
  { value: 'UNEMPLOYED', label: 'Desempregado' },
]
const phoneMasks = ['(00) 0000-0000', '(00) 00000-0000']

export function ConvictedFormDialog({ open, onOpenChange, convicted = null, onSuccess }) {
  const { url } = useConvictedPhoto(open ? convicted?.id : null)
  const { form, fileRef, preview, isEditing, isSearchingCep, isProcessingPhoto, actions, error } =
    useConvictedForm(convicted, {
      photoUrl: url,
      open,
      onSuccess: (result) => {
        onSuccess?.(result)
        onOpenChange(false)
      },
    })
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = form
  const disabled = isSubmitting || isProcessingPhoto
  const input = (name, label, props = {}) => (
    <InputField
      id={`convicted-${name}`}
      label={label}
      required
      variant="modal"
      disabled={disabled}
      error={get(errors, name)?.message}
      registration={register(name)}
      {...props}
    />
  )
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Editar Apenado' : 'Cadastrar Novo Apenado'}
      description={
        isEditing
          ? 'Atualize as informações do apenado no formulário abaixo'
          : 'Preencha os dados do apenado no formulário abaixo'
      }
      onSubmit={(event) => {
        event.preventDefault()
        if (!disabled) return actions.submit()
      }}
      isSubmitting={isSubmitting}
      isProcessing={isProcessingPhoto}
      submitLabel={isEditing ? 'Salvar alterações' : 'Cadastrar apenado'}
      error={error}
    >
      <ImageUploadField
        id="convicted-photo"
        label="Foto de reconhecimento"
        labelClassName="text-muted-foreground mb-2 text-xs font-semibold uppercase"
        required={!isEditing}
        variant="modal"
        error={errors.photo?.message}
        disabled={disabled}
        description="Envie uma foto frontal nítida para reconhecimento facial. Formatos aceitos: JPG ou PNG (máx. 5 MiB)."
        preview={preview}
        accept="image/jpeg,image/png"
        fileInputRef={fileRef}
        onChange={actions.handleFoto}
        selectLabel="Selecionar foto"
        changeLabel="Alterar foto"
        onRemove={form.watch('photo') ? actions.removerFoto : undefined}
        removeLabel="Descartar seleção"
        processingMessage={isProcessingPhoto ? 'Preparando foto...' : undefined}
      />
      <FormSection title="Dados pessoais">
        {input('name', 'Nome completo', { placeholder: 'Nome completo do apenado' })}
        <FormGrid>
          <CpfField
            id="convicted-cpf"
            label="CPF"
            required
            variant="modal"
            registration={register('cpf')}
            disabled={disabled}
            error={errors.cpf?.message}
          />
          {input('birthDate', 'Data de nascimento', { type: 'date' })}
        </FormGrid>
        <Controller
          control={control}
          name="employmentStatus"
          render={({ field }) => (
            <SelectField
              id="convicted-employment"
              label="Situação trabalhista"
              required
              variant="modal"
              field={field}
              options={employmentOptions}
              placeholder="Selecione a situação trabalhista"
              disabled={disabled}
              error={errors.employmentStatus?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <MaskedInputField
              id="convicted-phone"
              label="Telefone de contato"
              required
              variant="modal"
              field={field}
              mask={phoneMasks}
              placeholder="(00) 00000-0000"
              disabled={disabled}
              error={errors.phone?.message}
            />
          )}
        />
      </FormSection>
      <FormSection title="Endereço">
        <FormGrid>
          <Controller
            control={control}
            name="address.zipCode"
            render={({ field }) => (
              <MaskedInputField
                id="convicted-cep"
                label="CEP"
                required
                variant="modal"
                field={field}
                mask="00000-000"
                placeholder="00000-000"
                disabled={disabled}
                error={errors.address?.zipCode?.message}
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled || isSearchingCep}
                    onClick={actions.buscarCep}
                    aria-label="Buscar CEP"
                    aria-invalid={errors.address?.zipCode ? true : undefined}
                    aria-describedby={errors.address?.zipCode ? 'convicted-cep-error' : undefined}
                  >
                    {isSearchingCep ? <Loader2 className="animate-spin" /> : <Search />}
                  </Button>
                }
              />
            )}
          />
          {input('address.street', 'Logradouro', {
            placeholder: 'Rua, avenida, etc.',
          })}
        </FormGrid>
        <FormGrid>
          {input('address.number', 'Número', { placeholder: '123' })}
          {input('address.complement', 'Complemento', {
            required: false,
            placeholder: 'Apto, bloco (opcional)',
          })}
        </FormGrid>
        <FormGrid>
          {input('address.neighborhood', 'Bairro', {
            placeholder: 'Bairro',
          })}
          {input('address.city', 'Cidade', { placeholder: 'Cidade' })}
        </FormGrid>
        <Controller
          control={control}
          name="address.state"
          render={({ field }) => (
            <SelectField
              id="convicted-state"
              label="UF"
              required
              variant="modal"
              field={field}
              options={stateOptions}
              placeholder="Selecione a UF"
              contentProps={{
                position: 'popper',
                side: 'bottom',
                avoidCollisions: false,
                className: 'max-h-[min(15rem,var(--radix-select-content-available-height))]',
              }}
              disabled={disabled}
              error={errors.address?.state?.message}
            />
          )}
        />
      </FormSection>
      <FormSection title="Processos">
        <Controller
          control={control}
          name="processes"
          render={({ field }) => (
            <ProcessSelector
              processes={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              disabled={disabled}
              error={
                errors.processes &&
                (errors.processes.message ||
                  errors.processes.root?.message ||
                  'Verifique os processos selecionados.')
              }
            />
          )}
        />
      </FormSection>
    </FormDialog>
  )
}
export const ApenadoCreateDialog = ConvictedFormDialog
export const ApenadoEditDialog = ConvictedFormDialog
