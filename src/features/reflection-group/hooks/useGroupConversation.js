import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/features/authentication'
import { useGroupParticipantsDraft } from './useGroupParticipantsDraft'
import { groupConversationService } from '../services/groupConversationService'

export function hasMeetingRecords(encontro) {
  if (!encontro) return false
  return (
    (encontro.attendance?.length ?? 0) > 0 ||
    (encontro.present?.length ?? 0) > 0 ||
    (encontro.absent?.length ?? 0) > 0 ||
    Object.keys(encontro.justifications ?? {}).length > 0
  )
}

export function getPertinentMeetingParticipants(group, encontro) {
  if (!encontro) return []

  if (encontro.status === 'REALIZADO' && Array.isArray(encontro.attendance)) {
    return encontro.attendance.map((record) => ({
      id: record.convictedId,
      fullName: record.convictedName,
    }))
  }

  const memberships = group?.participantMemberships
  if (Array.isArray(memberships) && memberships.length > 0 && encontro.date) {
    const meetingDate = encontro.date.slice(0, 10)
    const currentById = new Map((group?.participants ?? []).map((person) => [person.id, person]))
    const unique = new Map()

    memberships.forEach((membership) => {
      const start = membership.startDate?.slice(0, 10)
      const end = membership.endDate ? membership.endDate.slice(0, 10) : null
      if (start && start <= meetingDate && (!end || meetingDate <= end)) {
        if (!unique.has(membership.convictedId)) {
          const current = currentById.get(membership.convictedId)
          unique.set(membership.convictedId, {
            id: membership.convictedId,
            fullName: current?.fullName ?? membership.convictedName,
          })
        }
      }
    })

    return [...unique.values()]
  }

  return group?.participants ?? []
}

export function useGroupConversation(id) {
  const { session } = useSession()
  const scope = `${session?.tenant?.id ?? ''}:${session?.user?.id ?? ''}`
  const requestKey = `${scope}:${id}`
  const [error, setError] = useState(null)
  const [loadedKey, setLoadedKey] = useState(null)
  const [revision, setRevision] = useState(0)
  const [isLoading, setLoading] = useState(true)
  const [isSavingMeeting, setSavingMeeting] = useState(false)
  const [group, setGroup] = useState(null)
  const [isParticipantsModalOpen, setParticipantsModalOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEncontro, setSelectedEncontro] = useState(null)
  const [participantStatuses, setParticipantStatuses] = useState({})
  const [justifications, setJustifications] = useState({})
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [editEncontro, setEditEncontro] = useState(null)
  const [isEditEncontroOpen, setIsEditEncontroOpen] = useState(false)
  const [editEncontroData, setEditEncontroData] = useState('')
  const [editEncontroTema, setEditEncontroTema] = useState('')
  const [isNewEncontroModalOpen, setIsNewEncontroModalOpen] = useState(false)
  const [newEncontroData, setNewEncontroData] = useState('')
  const [newEncontroTema, setNewEncontroTema] = useState('')
  const [justificationTypes, setJustificationTypes] = useState({})
  const [notRealizedEncontro, setNotRealizedEncontro] = useState(null)
  const [notRealizedError, setNotRealizedError] = useState(null)
  const meetingSaveInFlight = useRef(false)
  const reload = () => setRevision((value) => value + 1)
  const canManageParticipants = ['admin', 'operator'].includes(session?.user?.role?.key)
  const canManageMeetings = canManageParticipants
  const participantDraft = useGroupParticipantsDraft({
    groupId: group?.id,
    scopeKey: scope,
    enabled: isParticipantsModalOpen,
    canEdit: canManageParticipants && ['PLANNED', 'ACTIVE'].includes(group?.status),
    onUpdated: (participants, updatedGroup) => {
      setGroup((current) =>
        current
          ? {
              ...current,
              participants,
              participantMemberships:
                updatedGroup?.participantMemberships ?? current.participantMemberships,
            }
          : current
      )
    },
  })

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    groupConversationService
      .getById(id, scope, { signal: controller.signal })
      .then((value) => {
        if (current) {
          setGroup(value)
          setError(null)
          setLoadedKey(requestKey)
          setLoading(false)
          setIsModalOpen(false)
          setSelectedEncontro(null)
          setIsEditEncontroOpen(false)
          setIsNewEncontroModalOpen(false)
          setNotRealizedEncontro(null)
          setNotRealizedError(null)
        }
      })
      .catch((cause) => {
        if (current && cause.name !== 'AbortError') {
          setGroup(null)
          setError('Não foi possível carregar o grupo. Tente novamente.')
          setLoadedKey(requestKey)
          setLoading(false)
        }
      })
    return () => {
      current = false
      controller.abort()
    }
  }, [id, scope, requestKey, revision])

  const commit = async (updated, { onError } = {}) => {
    if (meetingSaveInFlight.current) return false
    meetingSaveInFlight.current = true
    setSavingMeeting(true)
    try {
      const saved = await groupConversationService.save(updated, scope)
      setGroup(saved)
      setError(null)
      setNotRealizedError(null)
      return true
    } catch (cause) {
      if (onError) {
        onError(cause.message)
      } else {
        setError(cause.message)
      }
      return false
    } finally {
      meetingSaveInFlight.current = false
      setSavingMeeting(false)
    }
  }

  const requestCloseParticipants = () => {
    if (participantDraft.requestClose()) setParticipantsModalOpen(false)
  }
  const saveParticipants = async () => {
    if (await participantDraft.save()) setParticipantsModalOpen(false)
  }
  const confirmDiscardParticipants = () => {
    const discarded = participantDraft.confirmDiscard()
    if (discarded) setParticipantsModalOpen(false)
    return discarded
  }

  const formatDate = (date) => {
    try {
      return date ? date.slice(0, 10).split('-').reverse().join('/') : ''
    } catch {
      return ''
    }
  }

  const getParticipantPresencas = (participant) =>
    (group?.meetings ?? []).filter(
      (meeting) => meeting.status === 'REALIZADO' && meeting.present.includes(participant.id)
    ).length

  const getParticipantFaltas = (participant) =>
    (group?.meetings ?? []).filter(
      (meeting) => meeting.status === 'REALIZADO' && meeting.absent.includes(participant.id)
    ).length

  const getParticipantElegibilidade = (participant) => {
    const minimo = group?.minimumMeetings ?? 0
    const presencas = getParticipantPresencas(participant)

    return Math.max(minimo - presencas, 0)
  }

  const getRealizedEncontros = () => {
    return (group?.meetings || []).filter((e) => e.status === 'REALIZADO').length
  }

  const getTotalEncontrosNotCanceled = () => {
    return (group?.meetings || []).filter((e) => e.status !== 'CANCELADO').length
  }

  const getUnjustifiedAbsentees = () => {
    return (group?.participants ?? []).filter((person) => getParticipantFaltas(person) > 0)
  }

  const getEligibleParticipants = () => {
    if (!group?.participants) return []

    const minimo = group?.minimumMeetings ?? 0

    return group.participants.filter((participant) => {
      const presencas = getParticipantPresencas(participant)
      return presencas >= minimo
    })
  }

  const isEncontroAtrasado = (encontro) => {
    if (encontro.status !== 'PENDENTE') return false

    try {
      const encontroDate = new Date(`${encontro.date}T00:00:00`)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return encontroDate < today
    } catch {
      return false
    }
  }

  const getPertinentParticipants = (encontro) => getPertinentMeetingParticipants(group, encontro)

  const canMarkNotRealized = (encontro) =>
    Boolean(
      canManageMeetings &&
      encontro &&
      encontro.status === 'PENDENTE' &&
      !hasMeetingRecords(encontro)
    )

  const openNewEncontroModal = () => {
    setError(null)
    setNewEncontroData('')
    setNewEncontroTema('')
    setIsNewEncontroModalOpen(true)
  }

  const closeNewEncontroModal = () => {
    setIsNewEncontroModalOpen(false)
    setNewEncontroData('')
    setNewEncontroTema('')
    setError(null)
  }

  const handleCreateEncontro = async () => {
    if (!group || !canManageMeetings || !newEncontroData || !newEncontroTema.trim()) {
      return
    }

    const newId = crypto.randomUUID()
    const newEncontro = {
      id: newId,
      date: newEncontroData,
      subject: newEncontroTema.trim(),
      present: [],
      absent: [],
      justifications: {},
      status: 'PENDENTE',
    }

    const updatedGroup = {
      ...group,
      meetings: [...(group.meetings || []), newEncontro],
    }

    if (!(await commit(updatedGroup))) return

    closeNewEncontroModal()
  }

  const handleEditEncontro = (encontro) => {
    if (!encontro || !canManageMeetings) return
    if (encontro.status !== 'PENDENTE') return

    setError(null)
    setEditEncontro(encontro)
    setEditEncontroData(encontro.date || '')
    setEditEncontroTema(encontro.subject || '')
    setIsEditEncontroOpen(true)
  }

  const handleSaveEditEncontro = async () => {
    if (!editEncontro || !canManageMeetings) return
    if (editEncontro.status !== 'PENDENTE') return

    const updatedEncontro = {
      ...editEncontro,
      date: editEncontroData,
      subject: editEncontroTema.trim(),
    }

    const updatedGroup = {
      ...group,
      meetings: (group.meetings || []).map((e) => (e.id === editEncontro.id ? updatedEncontro : e)),
    }

    if (!(await commit(updatedGroup))) return

    setIsEditEncontroOpen(false)
    setEditEncontro(null)
    setEditEncontroData('')
    setEditEncontroTema('')
  }

  const openPresenceModal = (encontro) => {
    if (!encontro) return
    setError(null)
    setSelectedEncontro(encontro)
    setParticipantStatuses({})
    setJustifications({})
    setJustificationTypes({})
    setIsConfirmed(false)
    setIsModalOpen(true)
  }

  const closePresenceModal = () => {
    if (isSavingMeeting) return
    setIsModalOpen(false)
    setSelectedEncontro(null)
    setParticipantStatuses({})
    setJustifications({})
    setJustificationTypes({})
    setIsConfirmed(false)
    setError(null)
  }

  const handleParticipantStatusChange = (participantId, status) => {
    setParticipantStatuses((prev) => ({
      ...prev,
      [participantId]: status,
    }))
  }

  const handleJustificationChange = (participantId, text) => {
    const limitedText = text.substring(0, 200)
    setJustifications((prev) => ({
      ...prev,
      [participantId]: limitedText,
    }))
  }

  const handleJustificationTypeChange = (participantId, type) => {
    setJustificationTypes((prev) => ({
      ...prev,
      [participantId]: type,
    }))
  }

  const isConfirmDisabled = () => {
    if (
      !selectedEncontro ||
      selectedEncontro.status !== 'PENDENTE' ||
      !canManageMeetings ||
      !isConfirmed ||
      isSavingMeeting
    ) {
      return true
    }

    const pertinent = getPertinentParticipants(selectedEncontro)
    if (!pertinent.every((person) => participantStatuses[person.id])) {
      return true
    }

    return pertinent.some(
      (person) => participantStatuses[person.id] === 'JUSTIFICADO' && !justificationTypes[person.id]
    )
  }

  const handleConfirmPresences = async () => {
    if (!group || !selectedEncontro || isConfirmDisabled()) return

    const pertinent = getPertinentParticipants(selectedEncontro)
    const updatedEncontro = {
      ...selectedEncontro,
      status: 'REALIZADO',
      present: pertinent
        .filter((person) => participantStatuses[person.id] === 'PRESENTE')
        .map((person) => person.id),
      absent: pertinent
        .filter((person) => participantStatuses[person.id] === 'AUSENTE')
        .map((person) => person.id),
      justifications: Object.fromEntries(
        pertinent
          .filter((person) => participantStatuses[person.id] === 'JUSTIFICADO')
          .map((person) => [
            person.id,
            {
              text: justifications[person.id] || '',
              type: justificationTypes[person.id] || '',
            },
          ])
      ),
    }

    const updatedGroup = {
      ...group,
      meetings: (group.meetings || []).map((e) =>
        e.id === selectedEncontro.id ? updatedEncontro : e
      ),
    }

    if (!(await commit(updatedGroup))) return

    closePresenceModal()
  }

  const openNotRealizedDialog = (encontro) => {
    if (!canMarkNotRealized(encontro)) return
    setNotRealizedError(null)
    setNotRealizedEncontro(encontro)
  }

  const closeNotRealizedDialog = () => {
    if (isSavingMeeting) return
    setNotRealizedEncontro(null)
    setNotRealizedError(null)
  }

  const handleConfirmNotRealized = async () => {
    if (!group || !notRealizedEncontro || isSavingMeeting) return false
    if (!canMarkNotRealized(notRealizedEncontro)) {
      setNotRealizedError(
        'Não é possível marcar como não realizado um encontro já realizado ou com presenças registradas.'
      )
      return false
    }

    const updatedEncontro = {
      ...notRealizedEncontro,
      status: 'CANCELADO',
    }

    const updatedGroup = {
      ...group,
      meetings: (group.meetings || []).map((e) =>
        e.id === notRealizedEncontro.id ? updatedEncontro : e
      ),
    }

    const saved = await commit(updatedGroup, { onError: setNotRealizedError })
    if (!saved) return false

    setNotRealizedEncontro(null)
    setNotRealizedError(null)
    return true
  }

  return {
    isLoading: isLoading || loadedKey !== requestKey,
    isSavingMeeting,
    group,
    isParticipantsModalOpen,
    openParticipantsModal: () => setParticipantsModalOpen(true),
    setParticipantsModalOpen,
    requestCloseParticipants,
    saveParticipants,
    confirmDiscardParticipants,
    cancelDiscardParticipants: participantDraft.cancelDiscard,
    participantDraft,
    canManageParticipants,
    canManageMeetings,
    isModalOpen,
    setIsModalOpen,
    selectedEncontro,
    participantStatuses,
    justifications,
    isConfirmed,
    setIsConfirmed,
    isEditEncontroOpen,
    setIsEditEncontroOpen,
    editEncontroData,
    setEditEncontroData,
    editEncontroTema,
    setEditEncontroTema,
    isNewEncontroModalOpen,
    setIsNewEncontroModalOpen,
    newEncontroData,
    setNewEncontroData,
    newEncontroTema,
    setNewEncontroTema,
    justificationTypes,
    notRealizedEncontro,
    notRealizedError,
    formatDate,
    getParticipantPresencas,
    getParticipantFaltas,
    getParticipantElegibilidade,
    getRealizedEncontros,
    getTotalEncontrosNotCanceled,
    getUnjustifiedAbsentees,
    getEligibleParticipants,
    getPertinentParticipants,
    hasMeetingRecords,
    canMarkNotRealized,
    isEncontroAtrasado,
    openNewEncontroModal,
    closeNewEncontroModal,
    handleCreateEncontro,
    handleEditEncontro,
    handleSaveEditEncontro,
    openPresenceModal,
    closePresenceModal,
    handleParticipantStatusChange,
    handleJustificationChange,
    handleJustificationTypeChange,
    isConfirmDisabled,
    handleConfirmPresences,
    openNotRealizedDialog,
    closeNotRealizedDialog,
    handleConfirmNotRealized,
    error,
    reload,
  }
}
