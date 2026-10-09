import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getGroupFormSchema } from '../schemas/groupSchemas'

function initialValues(group) {
  return {
    name: group?.name || '',
    description: group?.description || '',
    subject: group?.subject || '',
    presenters: (group?.presenters || []).join('\n'),
    totalMeetingsCount: group?.totalMeetingsCount ?? 8,
    minimumMeetingsCount: group?.minimumMeetingsCount ?? 6,
    meetingBaseTime: group?.meetingBaseTime?.slice(0, 5) || '',
    frequency: group?.frequency || 'WEEKLY',
    startDate: group?.startDate?.slice(0, 10) || '',
    predictedEndDate: group?.predictedEndDate?.slice(0, 10) || '',
    status: group?.status || 'PLANNED',
    convictedUuids: [],
    participants: group?.convicteds || [],
  }
}

export function useGroupForm({ group, open, onSubmit, onOpenChange }) {
  const form = useForm({
    defaultValues: initialValues(group),
    resolver: zodResolver(getGroupFormSchema(group)),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })
  const { reset, setError } = form
  const [error, setErrorMessage] = useState(null)
  const [persistedStatus, setPersistedStatus] = useState(group?.status)
  const snapshot = useRef(group)
  const active = useRef(false)
  const generation = useRef(0)
  const changed = useRef(false)
  const pending = useRef(false)
  useEffect(() => {
    snapshot.current = group
  }, [group])
  useEffect(() => {
    active.current = open
    generation.current += 1
    changed.current = false
    reset(initialValues(snapshot.current))
    setPersistedStatus(snapshot.current?.status)
    setErrorMessage(null)
    return () => {
      active.current = false
      generation.current += 1
    }
  }, [open, group?.id, reset])
  const submit = async (data) => {
    if (pending.current) return
    pending.current = true
    const started = generation.current
    setErrorMessage(null)
    try {
      const participantIds = data.participants.map((person) => person.id)
      const input = group
        ? {
            metadata: {
              name: data.name,
              subject: data.subject,
              presenters: data.presenters,
              status: data.status,
              predictedEndDate: data.predictedEndDate || null,
              ...(persistedStatus === 'PLANNED' ? { startDate: data.startDate } : {}),
            },
            participantIds,
          }
        : { ...data, convictedUuids: participantIds }
      if (!group) delete input.participants
      await onSubmit(input)
      if (active.current && generation.current === started) onOpenChange(false)
    } catch (cause) {
      if (!active.current || generation.current !== started) return
      changed.current = changed.current || Boolean(cause.possiblyChanged)
      if (cause.currentGroup) setPersistedStatus(cause.currentGroup.status)
      for (const field of cause.fields || [])
        setError(field.field, { type: 'server', message: field.message })
      setErrorMessage(cause.message || 'Não foi possível salvar o grupo.')
    } finally {
      pending.current = false
    }
  }
  const handleOpenChange = (next) => {
    if (pending.current) return
    onOpenChange(next, changed.current)
  }
  return { form, submit, handleOpenChange, error, persistedStatus }
}
