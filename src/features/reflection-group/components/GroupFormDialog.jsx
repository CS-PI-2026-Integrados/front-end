import { FormDialog } from '@/shared/components/FormDialog'
import { useGroupForm } from '../hooks/useGroupForm'
import { GroupForm } from './GroupForm'

export function GroupFormDialog({ group, open, onOpenChange, onSubmit, isSaving }) {
  const { form, submit, handleOpenChange, error, persistedStatus } = useGroupForm({
    group,
    open,
    onSubmit,
    onOpenChange,
  })
  const { isSubmitting } = form.formState
  const editing = Boolean(group)
  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={editing ? 'Editar grupo reflexivo' : 'Novo Grupo Reflexivo'}
      description={
        editing
          ? 'Atualize os dados do grupo. A descrição é somente leitura.'
          : 'Preencha os dados do grupo e o planejamento dos encontros'
      }
      onSubmit={form.handleSubmit(submit)}
      isSubmitting={isSubmitting || isSaving}
      submitLabel={editing ? 'Salvar grupo' : 'Cadastrar grupo'}
      error={error}
    >
      <GroupForm
        form={form}
        editing={editing}
        persistedStatus={persistedStatus}
        isSaving={isSubmitting || isSaving}
      />
    </FormDialog>
  )
}
