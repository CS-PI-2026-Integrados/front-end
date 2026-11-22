import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/features/authentication'
import { useGroupParticipantsDraft } from './useGroupParticipantsDraft'
import { groupConversationService } from '../services/groupConversationService'

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
  const [encontroNewStatus, setEncontroNewStatus] = useState(null)
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
  const meetingSaveInFlight = useRef(false)
  const reload = () => setRevision((value) => value + 1)
  const canManageParticipants = ['admin', 'operator'].includes(session?.user?.role?.key)
  const participantDraft = useGroupParticipantsDraft({
    groupId: group?.id,
    scopeKey: scope,
    enabled: isParticipantsModalOpen,
    canEdit: canManageParticipants && ['PLANNED', 'ACTIVE'].includes(group?.status),
    onUpdated: (participants) => {
      setGroup((current) => (current ? { ...current, participants } : current))
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
  const commit = async (updated) => {
    if (meetingSaveInFlight.current) return false
    meetingSaveInFlight.current = true
    setSavingMeeting(true)
    try {
      const saved = await groupConversationService.save(updated, scope)
      setGroup(saved)
      setError(null)
      return true
    } catch (cause) {
      setError(cause.message)
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

  const openNewEncontroModal = () => {
    setNewEncontroData('')
    setNewEncontroTema('')
    setIsNewEncontroModalOpen(true)
  }

  const closeNewEncontroModal = () => {
    setIsNewEncontroModalOpen(false)
    setNewEncontroData('')
    setNewEncontroTema('')
  }

  const handleCreateEncontro = async () => {
    if (!group || !newEncontroData || !newEncontroTema.trim()) {
      return
    }

    const newId = crypto.randomUUID()
    const newEncontro = {
      id: newId,
      date: newEncontroData,
      subject: newEncontroTema,
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
    if (!encontro) return
    if (encontro.status !== 'PENDENTE') return

    setEditEncontro(encontro)
    setEditEncontroData(encontro.date || '')
    setEditEncontroTema(encontro.subject || '')
    setIsEditEncontroOpen(true)
  }

  const handleSaveEditEncontro = async () => {
    if (!editEncontro) return
    if (editEncontro.status !== 'PENDENTE') return

    const updatedEncontro = {
      ...editEncontro,
      date: editEncontroData,
      subject: editEncontroTema,
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
    setSelectedEncontro(encontro)
    setEncontroNewStatus(encontro.status)
    setParticipantStatuses({})
    setJustifications({})
    setJustificationTypes({})
    setIsConfirmed(false)
    setIsModalOpen(true)
  }

  const closePresenceModal = () => {
    setIsModalOpen(false)
    setSelectedEncontro(null)
    setEncontroNewStatus(null)
    setParticipantStatuses({})
    setJustifications({})
    setJustificationTypes({})
    setIsConfirmed(false)
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

  const areAllParticipantsStatusFilled = () => {
    if (!group?.participants || encontroNewStatus !== 'REALIZADO') return true

    return group.participants.every((p) => participantStatuses[p.id])
  }

  const isConfirmDisabled = () => {
    if (!isConfirmed || isSavingMeeting) return true
    if (encontroNewStatus === 'CANCELADO') return false
    if (!areAllParticipantsStatusFilled()) return true
    return Object.entries(participantStatuses).some(
      ([participantId, status]) => status === 'JUSTIFICADO' && !justificationTypes[participantId]
    )
  }

  const handleConfirmPresences = async () => {
    if (!group || !selectedEncontro || isConfirmDisabled()) return

    const updatedEncontro = {
      ...selectedEncontro,
      status: encontroNewStatus,
    }

    if (encontroNewStatus === 'REALIZADO') {
      updatedEncontro.present = group.participants
        .filter((person) => participantStatuses[person.id] === 'PRESENTE')
        .map((person) => person.id)
      updatedEncontro.absent = group.participants
        .filter((person) => participantStatuses[person.id] === 'AUSENTE')
        .map((person) => person.id)

      updatedEncontro.justifications = {}
      Object.keys(participantStatuses).forEach((id) => {
        if (participantStatuses[id] === 'JUSTIFICADO') {
          updatedEncontro.justifications[id] = {
            text: justifications[id] || '',
            type: justificationTypes[id] || '',
          }
        }
      })
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
    isModalOpen,
    setIsModalOpen,
    selectedEncontro,
    encontroNewStatus,
    setEncontroNewStatus,
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
    formatDate,
    getParticipantPresencas,
    getParticipantFaltas,
    getParticipantElegibilidade,
    getRealizedEncontros,
    getTotalEncontrosNotCanceled,
    getUnjustifiedAbsentees,
    getEligibleParticipants,
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
    error,
    reload,
  }
}
