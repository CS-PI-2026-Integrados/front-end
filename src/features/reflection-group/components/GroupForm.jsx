import { Controller } from 'react-hook-form'
import { FormGrid, FormSection } from '@/shared/components/FormSection'
import { InputField } from '@/shared/components/form-fields/InputField'
import { TextareaField } from '@/shared/components/form-fields/TextareaField'
import { SelectField } from '@/shared/components/form-fields/SelectField'
import { groupFrequencies, groupStatuses } from '../schemas/groupSchemas'
import { GroupParticipantsField } from './GroupParticipantsField'

const frequencies = Object.entries(groupFrequencies).map(([value, label]) => ({ value, label }))
const statuses = Object.entries(groupStatuses).map(([value, label]) => ({ value, label }))

export function GroupForm({ form, editing, persistedStatus, isSaving }) {
  const {
    register,
    control,
    formState: { errors },
  } = form
  const input = (name, label, props = {}) => (
    <InputField
      id={`group-${name}`}
      label={label}
      required
      variant="modal"
      registration={register(name)}
      error={errors[name]?.message}
      disabled={isSaving}
      {...props}
    />
  )
  return (
    <>
      <FormSection title="Dados do grupo" first>
        <FormGrid>
          {input('name', 'Nome do grupo', { placeholder: 'Nome do grupo reflexivo' })}
          {input('subject', 'Tema', { placeholder: 'Tema dos encontros' })}
        </FormGrid>
        <TextareaField
          id="group-description"
          label="Descrição"
          required
          variant="modal"
          registration={register('description')}
          placeholder="Descreva os objetivos e a proposta do grupo"
          disabled={isSaving}
          error={errors.description?.message}
        />
        <TextareaField
          id="group-presenters"
          label="Ministrantes (um por linha)"
          required
          variant="modal"
          registration={register('presenters')}
          placeholder="Informe o nome de cada ministrante em uma linha"
          disabled={isSaving}
          error={errors.presenters?.message}
        />
      </FormSection>
      <FormSection title="Planejamento">
        {editing ? (
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SelectField
                id="group-status"
                label="Status"
                required
                variant="modal"
                field={field}
                options={statuses}
                disabled={isSaving}
                error={errors.status?.message}
              />
            )}
          />
        ) : (
          <>
            <FormGrid>
              {input('totalMeetingsCount', 'Total de encontros', { type: 'number', min: 1 })}
              {input('minimumMeetingsCount', 'Mínimo de encontros', { type: 'number', min: 1 })}
            </FormGrid>
            <FormGrid>
              <Controller
                control={control}
                name="frequency"
                render={({ field }) => (
                  <SelectField
                    id="group-frequency"
                    label="Frequência"
                    required
                    variant="modal"
                    field={field}
                    options={frequencies}
                    disabled={isSaving}
                    error={errors.frequency?.message}
                  />
                )}
              />
              {input('meetingBaseTime', 'Horário', { type: 'time' })}
            </FormGrid>
          </>
        )}
        <FormGrid>
          {input('startDate', 'Início', {
            type: 'date',
            disabled: isSaving || (editing && persistedStatus !== 'PLANNED'),
          })}
          {input('predictedEndDate', 'Término previsto', { type: 'date', required: false })}
        </FormGrid>
      </FormSection>
      <FormSection title="Participantes">
        <Controller
          control={control}
          name="participants"
          render={({ field }) => (
            <GroupParticipantsField
              field={field}
              disabled={isSaving}
              readOnly={editing && persistedStatus !== 'PLANNED'}
              error={
                errors.participants &&
                (errors.participants.message || 'Verifique os apenados selecionados.')
              }
            />
          )}
        />
      </FormSection>
    </>
  )
}
