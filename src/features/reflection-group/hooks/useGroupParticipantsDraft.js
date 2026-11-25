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
  const [groupStatus, setGroupStatus] = useState(null)
  const [loadedKey, setLoadedKey] = useState(null)
  const [isLoading, setLoading] = useState(Boolean(enabled && groupId))
  const [savingLoadKey, setSavingLoadKey] = useState(null)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [discardConfirmationOpen, setDiscardConfirmationOpen] = useState(false)
  const [revision, setRevision] = useState(0)
  const loadKey = `${requestKey}:${revision}:${enabled ? 'enabled' : 'disabled'}`
  const requestVersion = useRef(0)
  const mounted = useRef(true)
  const saveInFlight = useRef(null)
  const saveController = useRef(null)
  const currentKey = useRef(requestKey)
  const currentLoadKey = useRef(loadKey)

  currentKey.current = requestKey
  currentLoadKey.current = loadKey

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
    setGroupStatus(group?.status ?? null)
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
      setGroupStatus(null)
      setLoadedKey(loadKey)
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
          setLoadedKey(loadKey)
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
          setConfirmed(EMPTY_LIST)
          setDraft(EMPTY_LIST)
          setGroupStatus(null)
          setLoadedKey(loadKey)
          setError(cause.message || 'Não foi possível carregar os participantes.')
          setLoading(false)
        }
      })

    return () => {
      controller.abort()
      if (saveController.current) {
        saveController.current.abort()
        saveController.current = null
        saveInFlight.current = null
      }
    }
  }, [applyAuthoritativeGroup, enabled, groupId, loadKey, requestKey, service])

  const isCurrentRequest = Boolean(enabled && groupId && loadedKey === loadKey)
  const isCurrentSave =
    isCurrentRequest && savingLoadKey === loadKey && saveInFlight.current?.loadKey === loadKey
  const currentConfirmed = isCurrentRequest ? confirmed : EMPTY_LIST
  const currentDraft = isCurrentRequest ? draft : EMPTY_LIST
  const additions = useMemo(
    () => currentDraft.filter((person) => !currentConfirmed.some((item) => item.id === person.id)),
    [currentConfirmed, currentDraft]
  )
  const removals = useMemo(
    () => currentConfirmed.filter((person) => !currentDraft.some((item) => item.id === person.id)),
    [currentConfirmed, currentDraft]
  )
  const hasChanges = isCurrentRequest && (additions.length > 0 || removals.length > 0)

  const add = useCallback(
    (person) => {
      if (!person?.id || !canEdit || !isCurrentRequest) return
      setDraft((current) => {
        if (current.some((item) => item.id === person.id)) return current
        return [...current, toParticipant(person)]
      })
    },
    [canEdit, isCurrentRequest]
  )

  const remove = useCallback(
    (participantId) => {
      if (!participantId || !canEdit || !isCurrentRequest) return
      setDraft((current) => current.filter((person) => person.id !== participantId))
    },
    [canEdit, isCurrentRequest]
  )

  const cancel = useCallback(() => {
    if (saveInFlight.current || !isCurrentRequest) return false
    setDraft(currentConfirmed)
    setDiscardConfirmationOpen(false)
    setSaveError(null)
    return true
  }, [currentConfirmed, isCurrentRequest])

  const requestClose = useCallback(() => {
    if (hasChanges) {
      setDiscardConfirmationOpen(true)
      return false
    }
    return true
  }, [hasChanges])

  const confirmDiscard = useCallback(() => cancel(), [cancel])
  const cancelDiscard = useCallback(() => setDiscardConfirmationOpen(false), [])
  const reload = useCallback(() => {
    setLoadedKey(null)
    setRevision((value) => value + 1)
  }, [])

  const save = useCallback(async () => {
    if (
      !groupId ||
      !canEdit ||
      !hasChanges ||
      !isCurrentRequest ||
      saveInFlight.current ||
      requestKey !== currentKey.current
    ) {
      return false
    }

    const saveToken = { loadKey }
    saveInFlight.current = saveToken
    const controller = new AbortController()
    saveController.current = controller
    setSavingLoadKey(loadKey)
    setSaveError(null)
    setSaveStatus('saving')
    try {
      const result = await service.saveParticipants(
        groupId,
        { participantIds: currentDraft.map((person) => person.id) },
        { signal: controller.signal }
      )
      if (
        !mounted.current ||
        requestKey !== currentKey.current ||
        loadKey !== currentLoadKey.current
      ) {
        return false
      }
      if (!result) throw new Error('O serviço não retornou o estado atualizado.')

      const participants = applyAuthoritativeGroup(result)
      onUpdated?.(participants, result)
      setSaveStatus('success')
      return true
    } catch (cause) {
      if (
        !mounted.current ||
        requestKey !== currentKey.current ||
        loadKey !== currentLoadKey.current
      ) {
        return false
      }

      if (cause.name === 'AbortError' || controller.signal.aborted) {
        setSaveStatus('idle')
        setSaveError(null)
        return false
      }

      if (cause.currentGroup) {
        const participants = toParticipants(cause.currentGroup)
        setConfirmed(participants)
        setGroupStatus(cause.currentGroup.status ?? null)
        onUpdated?.(participants)
        setSaveStatus(cause.partialSuccess === true ? 'partial' : 'error')
      } else {
        setSaveStatus('error')
      }
      setSaveError(cause.message || 'Não foi possível salvar os participantes.')
      return false
    } finally {
      if (saveInFlight.current === saveToken) {
        saveInFlight.current = null
        if (saveController.current === controller) saveController.current = null
        if (
          mounted.current &&
          requestKey === currentKey.current &&
          loadKey === currentLoadKey.current
        ) {
          setSavingLoadKey(null)
        }
      }
    }
  }, [
    applyAuthoritativeGroup,
    canEdit,
    currentDraft,
    groupId,
    hasChanges,
    isCurrentRequest,
    loadKey,
    onUpdated,
    requestKey,
    service,
  ])

  return {
    confirmed: currentConfirmed,
    participants: currentDraft,
    groupStatus: isCurrentRequest ? groupStatus : null,
    additions,
    removals,
    hasChanges,
    isLoading: Boolean(enabled && groupId && (!isCurrentRequest || isLoading)),
    isSaving: isCurrentSave,
    canSave: canEdit && isCurrentRequest && hasChanges && !isCurrentSave,
    error: isCurrentRequest ? error : null,
    saveError: isCurrentRequest ? saveError : null,
    saveStatus: isCurrentRequest ? saveStatus : 'idle',
    add,
    remove,
    save,
    cancel,
    requestClose,
    discardConfirmationOpen,
    confirmDiscard,
    cancelDiscard,
    reload,
  }
}
