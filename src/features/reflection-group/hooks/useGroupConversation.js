import { useEffect, useRef, useState } from 'react'
import { useSession } from '@/features/authentication'
import { groupConversationService } from '../services/groupConversationService'

export function useGroupConversation(id) {
  const { session } = useSession()
  const scope = `${session?.tenant?.id ?? ''}:${session?.user?.id ?? ''}`
  const requestKey = `${scope}:${id}`
  const active = useRef(true)
  const busy = useRef(false)
  const scopeRef = useRef(requestKey)
  scopeRef.current = requestKey
  const [error, setError] = useState(null)
  const [isSaving, setSaving] = useState(false)
  const [loadedKey, setLoadedKey] = useState(null)
  const [revision, setRevision] = useState(0)
  const reload = () => setRevision((value) => value + 1)
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])
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
  const commit = (updated) => {
    if (busy.current) return false
    try {
      setGroup(groupConversationService.save(updated, scope))
      setError(null)
      return true
    } catch (cause) {
      setError(cause.message)
      return false
    }
  }
  const [isLoading, setLoading] = useState(true)
  const [group, setGroup] = useState(null)

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

  const handleCreateEncontro = () => {
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

    if (!commit(updatedGroup)) return

    closeNewEncontroModal()
  }

  const handleEditEncontro = (encontro) => {
    if (!encontro) return
    const isAdmin = session?.user?.role?.key === 'admin'

    if (encontro.status !== 'PENDENTE' && !isAdmin) return

    setEditEncontro(encontro)
    setEditEncontroData(encontro.date || '')
    setEditEncontroTema(encontro.subject || '')
    setIsEditEncontroOpen(true)
  }

  const handleSaveEditEncontro = () => {
    if (!editEncontro) return
    const isAdmin = session?.user?.role?.key === 'admin'
    if (editEncontro.status !== 'PENDENTE' && !isAdmin) return

    const updatedEncontro = {
      ...editEncontro,
      date: editEncontroData,
      subject: editEncontroTema,
    }

    const updatedGroup = {
      ...group,
      meetings: (group.meetings || []).map((e) => (e.id === editEncontro.id ? updatedEncontro : e)),
    }

    if (!commit(updatedGroup)) return

    setIsEditEncontroOpen(false)
    setEditEncontro(null)
    setEditEncontroData('')
    setEditEncontroTema('')
  }

  const handleRemoveParticipant = async (participantId) => {
    if (!group || busy.current) return
    const startedScope = scopeRef.current
    busy.current = true
    setSaving(true)
    setError(null)
    try {
      const updated = await groupConversationService.removeParticipant(group, participantId, scope)
      if (active.current && scopeRef.current === startedScope) setGroup(updated)
    } catch (cause) {
      if (active.current && scopeRef.current === startedScope) setError(cause.message)
    } finally {
      busy.current = false
      if (active.current && scopeRef.current === startedScope) setSaving(false)
    }
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
    if (encontroNewStatus === 'CANCELADO') {
      return !isConfirmed
    }

    return !isConfirmed || !areAllParticipantsStatusFilled()
  }

  const handleConfirmPresences = () => {
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

    if (!commit(updatedGroup)) return

    closePresenceModal()
  }

  return {
    isLoading: isLoading || loadedKey !== requestKey,
    group,
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
    handleRemoveParticipant,
    openPresenceModal,
    closePresenceModal,
    handleParticipantStatusChange,
    handleJustificationChange,
    handleJustificationTypeChange,
    isConfirmDisabled,
    handleConfirmPresences,
    error,
    isSaving,
    reload,
  }
}
