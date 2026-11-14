import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { groupsService } from '../services/groupsService'

const EMPTY_LIST = []

const toParticipant = (person) => ({
  id: person.id,
  fullName: person.fullName ?? person.name ?? '',
  cpf: person.cpf ?? person.document ?? '',
})

const toParticipants = (group) => {
  const people = Array.isArray(group)
    ? group
    : (group?.convicteds ?? group?.participants ?? EMPTY_LIST)
  const unique = new Map()

  people.forEach((person) => {
    if (person?.id && !unique.has(person.id)) unique.set(person.id, toParticipant(person))
  })

  return [...unique.values()]
}

export function useGroupParticipantsDraft({
  groupId,
  scopeKey = '',
  canEdit = true,
  enabled = true,
  service = groupsService,
  onUpdated,
} = {}) {
  const requestKey = `${scopeKey}:${groupId ?? ''}`
  const [confirmed, setConfirmed] = useState(EMPTY_LIST)
  const [draft, setDraft] = useState(EMPTY_LIST)
  const [isLoading, setLoading] = useState(Boolean(enabled && groupId))
  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
  const requestVersion = useRef(0)
  const mounted = useRef(true)
  const saveInFlight = useRef(false)
  const saveController = useRef(null)
  const currentKey = useRef(requestKey)

  currentKey.current = requestKey

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  const applyAuthoritativeGroup = useCallback((group) => {
    const participants = toParticipants(group)
    setConfirmed(participants)
    setDraft(participants)
    return participants
  }, [])

  useEffect(() => {
    const version = ++requestVersion.current
    const controller = new AbortController()

    setDiscardConfirmationOpen(false)
    setError(null)
    setSaveError(null)
    setSaveStatus('idle')

    if (!enabled || !groupId) {
      setLoading(false)
      setConfirmed(EMPTY_LIST)
      setDraft(EMPTY_LIST)
      return () => controller.abort()
    }

    setLoading(true)
    service
      .getById(groupId, { signal: controller.signal })
      .then((group) => {
        if (
          mounted.current &&
          version === requestVersion.current &&
          currentKey.current === requestKey
        ) {
          applyAuthoritativeGroup(group)
          setLoading(false)
        }
      })
      .catch((cause) => {
        if (
          mounted.current &&
          version === requestVersion.current &&
          currentKey.current === requestKey &&
          cause.name !== 'AbortError'
        ) {
          setError(cause.message || 'Não foi possível carregar os participantes.')
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
      saveController.current?.abort()
    }
  }, [applyAuthoritativeGroup, enabled, groupId, requestKey, service])

  const additions = useMemo(
    () => draft.filter((person) => !confirmed.some((item) => item.id === person.id)),
    [confirmed, draft]
  )
  const removals = useMemo(
    () => confirmed.filter((person) => !draft.some((item) => item.id === person.id)),
    [confirmed, draft]
  )
  const hasChanges = additions.length > 0 || removals.length > 0

  const add = useCallback((person) => {
    if (!person?.id) return
    setDraft((current) => {
      if (current.some((item) => item.id === person.id)) return current
      return [...current, toParticipant(person)]
    })
  }, [])

  const remove = useCallback((participantId) => {
    if (!participantId) return
    setDraft((current) => current.filter((person) => person.id !== participantId))
  }, [])

  const cancel = useCallback(() => {
    if (saveInFlight.current) return false
    setDraft(confirmed)
    setDiscardConfirmationOpen(false)
    setSaveError(null)
    return true
  }, [confirmed])

  const requestClose = useCallback(() => {
    if (hasChanges) {
      setDiscardConfirmationOpen(true)
      return false
    }
    return true
  }, [hasChanges])

  const confirmDiscard = useCallback(() => cancel(), [cancel])
  const cancelDiscard = useCallback(() => setDiscardConfirmationOpen(false), [])

  const save = useCallback(async () => {
    if (
      !groupId ||
      !canEdit ||
      !hasChanges ||
      isLoading ||
      saveInFlight.current ||
      requestKey !== currentKey.current
    ) {
      return false
    }

    saveInFlight.current = true
    const controller = new AbortController()
    saveController.current = controller
    setSaving(true)
    setSaveError(null)
    setSaveStatus('saving')
    try {
      const result = await service.saveParticipants(
        groupId,
        { participantIds: draft.map((person) => person.id) },
        { signal: controller.signal }
      )
      if (!mounted.current || requestKey !== currentKey.current) return false
      if (!result) throw new Error('O serviço não retornou o estado atualizado.')

      const participants = applyAuthoritativeGroup(result)
      onUpdated?.(participants)
      setSaveStatus('success')
      return true
    } catch (cause) {
      if (!mounted.current || requestKey !== currentKey.current) return false

      if (cause.currentGroup) {
        const participants = applyAuthoritativeGroup(cause.currentGroup)
        setDraft(draft)
        onUpdated?.(participants)
        setSaveStatus('partial')
      } else {
        setSaveStatus('error')
      }
      setSaveError(cause.message || 'Não foi possível salvar os participantes.')
      return false
    } finally {
      saveInFlight.current = false
      if (saveController.current === controller) saveController.current = null
      if (mounted.current && requestKey === currentKey.current) setSaving(false)
    }
  }, [
    applyAuthoritativeGroup,
    canEdit,
    draft,
    groupId,
    hasChanges,
    isLoading,
    onUpdated,
    requestKey,
    service,
  ])

  return {
    confirmed,
    participants: draft,
    additions,
    removals,
    hasChanges,
    isLoading,
    isSaving,
    canSave: canEdit && hasChanges && !isLoading && !isSaving,
    error,
    saveError,
    saveStatus,
    add,
    remove,
    save,
    cancel,
    requestClose,
    discardConfirmationOpen,
    confirmDiscard,
    cancelDiscard,
  }
}
