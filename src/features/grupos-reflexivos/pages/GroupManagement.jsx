import { useEffect, useState } from 'react'
import {
  Users,
  FileText,
  CheckCircle,
  TriangleAlert,
  Plus,
  Trash,
  ListCheck,
  Pencil,
  Settings,
} from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSession } from '@/features/autenticacao/context/sessionContext'
import { Spinner } from '@/shared/components/ui/spinner'
import { MetricCard } from '@/features/dashboard/components/dashboard/MetricCard.jsx'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Button } from '@/shared/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs.jsx'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog.jsx'
import toast from 'react-hot-toast'
import { Checkbox } from '@/shared/components/ui/checkbox.jsx'
import { listarGrupos, salvarGrupos } from '@/features/grupos-reflexivos/services/gruposService'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/shared/components/ui/card.jsx'

const getStatusBadgeColor = (situacao) => {
  const statusColors = {
    PENDENTE: 'bg-gray-600 text-white',
    REALIZADO: 'bg-green-900 text-white',
    CANCELADO: 'bg-yellow-900 text-white',
  }
  return statusColors[situacao] || 'bg-gray-200 text-gray-800'
}

const getParticipantStatusColor = (situacao) => {
  const statusColors = {
    PRESENTE: 'bg-green-900 text-green-200',
    AUSENTE: 'bg-red-600 text-red-200',
    JUSTIFICADO: 'bg-blue-600 text-blue-200',
  }
  return statusColors[situacao] || 'bg-gray-100 text-gray-800 border-gray-300'
}

const StatusBadge = ({ situacao }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(situacao)}`}
  >
    {status}
  </span>
)

function getStoredList() {
  // return mock

  const local = null

  if (!local) return listarGrupos()

  try {
    const parsed = JSON.parse(local)

    return Array.isArray(parsed) ? parsed : listarGrupos()
  } catch {
    return mock
  }
}

const GroupManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useSession()

  const [isLoading, setLoading] = useState(false)
  const [group, setGroup] = useState(null)
  const [documentoDisponivel, setDocumentoDisponivel] = useState(false)

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
      return new Date(date).toLocaleDateString()
    } catch {
      return ''
    }
  }

  const getParticipantPresencas = (participant) => {
    const totalEncontros = group?.encontros?.length ?? 0

    if (typeof participant?.presencas === 'number') {
      return participant.presencas
    }

    if (!totalEncontros) return 0

    return group.encontros.filter((encontro) => encontro.presentes?.includes(participant?.id))
      .length
  }

  const getParticipantFaltas = (participant) => {
    if (typeof participant?.faltas === 'number') {
      return participant.faltas
    }

    const totalEncontros = group?.encontros?.length ?? 0
    const presencas = getParticipantPresencas(participant)

    return Math.max(totalEncontros - presencas, 0)
  }

  const getParticipantElegibilidade = (participant) => {
    const minimo = group?.minimoEncontros ?? group?.minimoPresencas ?? 0
    const presencas = getParticipantPresencas(participant)

    return Math.max(minimo - presencas, 0)
  }

  const getRealizedEncontros = () => {
    return (group?.encontros || []).filter((e) => e.situacao === 'REALIZADO').length
  }

  const getTotalEncontrosNotCanceled = () => {
    return (group?.encontros || []).filter((e) => e.situacao !== 'CANCELADO').length
  }

  const getUnjustifiedAbsentees = () => {
    return []
  }

  const getEligibleParticipants = () => {
    if (!group?.participantes) return []

    const minimo = group?.minimoEncontros ?? group?.minimoPresencas ?? 0

    return group.participantes.filter((participant) => {
      const presencas = getParticipantPresencas(participant)
      return presencas >= minimo
    })
  }

  const isEncontroAtrasado = (encontro) => {
    if (encontro.situacao !== 'PENDENTE') return false

    try {
      const encontroDate = new Date(encontro.data)
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

    const newId = Math.max(...(group.encontros || []).map((e) => e.id), 0) + 1
    const newEncontro = {
      id: newId,
      data: newEncontroData,
      tema: newEncontroTema,
      presentes: [],
      ausentes: [],
      justificacoes: {},
      situacao: 'PENDENTE',
    }

    const updatedGroup = {
      ...group,
      encontros: [...(group.encontros || []), newEncontro],
    }

    setGroup(updatedGroup)

    try {
      const list = getStoredList()
      const updatedList = list.map((item) =>
        String(item.id) === String(group.id) ? updatedGroup : item
      )

      salvarGrupos(updatedList)
    } catch {}

    closeNewEncontroModal()
  }

  const handleEditEncontro = (encontro) => {
    if (!encontro) return
    const isAdmin = session?.user?.role?.level >= 2

    if (encontro.situacao !== 'PENDENTE' && !isAdmin) return

    setEditEncontro(encontro)
    setEditEncontroData(encontro.data || '')
    setEditEncontroTema(encontro.tema || '')
    setIsEditEncontroOpen(true)
  }

  const handleSaveEditEncontro = () => {
    if (!editEncontro) return
    const isAdmin = session?.user?.role?.level >= 2
    if (editEncontro.situacao !== 'PENDENTE' && !isAdmin) return

    const updatedEncontro = {
      ...editEncontro,
      data: editEncontroData,
      tema: editEncontroTema,
    }

    const updatedGroup = {
      ...group,
      encontros: (group.encontros || []).map((e) =>
        e.id === editEncontro.id ? updatedEncontro : e
      ),
    }

    setGroup(updatedGroup)

    try {
      const list = getStoredList()
      const updatedList = list.map((item) =>
        String(item.id) === String(group.id) ? updatedGroup : item
      )
      salvarGrupos(updatedList)
    } catch {}

    setIsEditEncontroOpen(false)
    setEditEncontro(null)
    setEditEncontroData('')
    setEditEncontroTema('')
  }

  const handleRemoveParticipant = (participantId) => {
    if (!group) return

    const updatedGroup = {
      ...group,
      participantes: (group.participantes || []).filter(
        (participant) => participant.id !== participantId
      ),
    }

    setGroup(updatedGroup)

    try {
      const list = getStoredList()
      const updatedList = list.map((item) =>
        String(item.id) === String(group.id) ? updatedGroup : item
      )

      salvarGrupos(updatedList)
    } catch {}
  }

  const openPresenceModal = (encontro) => {
    setSelectedEncontro(encontro)
    setEncontroNewStatus(encontro.situacao)
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
    if (!group?.participantes || encontroNewStatus !== 'REALIZADO') return true

    return group.participantes.every((p) => participantStatuses[p.id])
  }

  const isConfirmDisabled = () => {
    if (encontroNewStatus === 'CANCELADO') {
      return !isConfirmed
    }

    return !isConfirmed || !areAllParticipantsStatusFilled()
  }

  const handleConfirmPresences = () => {
    if (!group || !selectedEncontro) return

    const updatedEncontro = {
      ...selectedEncontro,
      situacao: encontroNewStatus,
    }

    if (encontroNewStatus === 'REALIZADO') {
      updatedEncontro.presentes = Object.keys(participantStatuses)
        .filter((id) => participantStatuses[id] === 'PRESENTE')
        .map(Number)
      updatedEncontro.ausentes = Object.keys(participantStatuses)
        .filter((id) => participantStatuses[id] === 'AUSENTE')
        .map(Number)

      updatedEncontro.justificacoes = {}
      Object.keys(participantStatuses).forEach((id) => {
        if (participantStatuses[id] === 'JUSTIFICADO') {
          updatedEncontro.justificacoes[id] = {
            texto: justifications[id] || '',
            tipo: justificationTypes[id] || '',
          }
        }
      })
    }

    const updatedGroup = {
      ...group,
      encontros: (group.encontros || []).map((e) =>
        e.id === selectedEncontro.id ? updatedEncontro : e
      ),
    }

    setGroup(updatedGroup)

    try {
      const list = getStoredList()
      const updatedList = list.map((item) =>
        String(item.id) === String(group.id) ? updatedGroup : item
      )

      salvarGrupos(updatedList)
    } catch {}

    closePresenceModal()
  }

  useEffect(() => {
    setLoading(true)

    try {
      const list = getStoredList()
      const gid = Number(id)
      const found = list.find((g) => String(g.id) === String(id) || g.id === gid)

      if (!found) {
        navigate('/grupos-reflexivos', { replace: true })
        return
      }

      setGroup(found)
    } catch {
      navigate('/grupos-reflexivos', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  return isLoading ? (
    <div className="flex h-full">
      <div className="m-auto">
        <Spinner />
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      <PageHeader
        title={group?.nome ?? 'Grupos Reflexivos'}
        description={
          group?.descricao ??
          group?.description ??
          'Gerencie grupos de reflexão e acompanhe participantes'
        }
      />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Participantes"
          description="Membros do grupo"
          data={group?.participantes?.length ?? 0}
          icon={<Users className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Encontros"
          description="Realizados / Planejados"
          data={`${getRealizedEncontros()}/${getTotalEncontrosNotCanceled()}`}
          icon={<FileText className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Min. Presenças"
          description="Para certificação"
          data={group?.minimoEncontros ?? group?.minimoPresencas ?? 0}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Elegíveis"
          description="Para certificado"
          data={
            group?.participantes
              ? group.participantes.filter(
                  (p) =>
                    (p.presencas ?? 0) >= (group?.minimoEncontros ?? group?.minimoPresencas ?? 0)
                ).length
              : 0
          }
          icon={<TriangleAlert className="text-muted-foreground h-4 w-4" />}
        />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="encontros">
          <TabsList>
            <TabsTrigger value="encontros">Encontros</TabsTrigger>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
            <TabsTrigger value="documentos">Documentos da vara</TabsTrigger>
          </TabsList>

          <TabsContent value="encontros">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-medium">Histórico de encontros</h4>
              <Button size="sm" onClick={openNewEncontroModal}>
                <Plus />
                Registrar encontro
              </Button>
            </div>

            <div className="bg-card rounded-md p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Presenças</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {(group?.encontros ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground h-32 text-center">
                        Nenhum encontro registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    (group.encontros || []).map((encontro) => (
                      <TableRow key={encontro.id}>
                        <TableCell>{formatDate(encontro.data) || null}</TableCell>
                        <TableCell className="max-w-[40ch] truncate">{encontro.tema}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge situacao={encontro.situacao || 'PENDENTE'} />
                            {isEncontroAtrasado(encontro) && (
                              <span className="text-xs text-red-600/85">Registro em atraso</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {`${encontro.presentes?.length ?? encontro.presencasCount ?? 0}/${group?.participantes?.length ?? 0}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="secondary" size="sm">
                                <Settings />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuGroup>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={
                                    encontro.situacao != 'PENDENTE' ||
                                    session?.user?.role?.level < 2
                                  }
                                  className="w-full justify-start"
                                  onClick={() => handleEditEncontro(encontro)}
                                >
                                  <Pencil /> Editar
                                </Button>
                                <Button
                                  className="w-full justify-start"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPresenceModal(encontro)}
                                  disabled={encontro.situacao === 'CANCELADO'}
                                  title={
                                    encontro.situacao === 'CANCELADO'
                                      ? 'Não é possível registrar presenças para encontros cancelados'
                                      : ''
                                  }
                                >
                                  <ListCheck />
                                  Presenças
                                </Button>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="participantes">
            <div className="bg-card rounded-md p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">Participantes do grupo</h4>
                <span className="text-muted-foreground text-sm">
                  {group?.participantes?.length ?? 0} participante(s)
                </span>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Presenças</TableHead>
                    <TableHead>Faltas</TableHead>
                    <TableHead>Elegibilidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {(group?.participantes ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground h-32 text-center">
                        Nenhum participante cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    (group?.participantes ?? []).map((participante) => {
                      const presencas = getParticipantPresencas(participante)
                      const faltas = getParticipantFaltas(participante)
                      const elegibilidade = getParticipantElegibilidade(participante)

                      return (
                        <TableRow key={participante.id}>
                          <TableCell className="font-medium">{participante.nome}</TableCell>
                          <TableCell>{presencas}</TableCell>
                          <TableCell>{faltas}</TableCell>
                          <TableCell>
                            {elegibilidade === 0 ? 'Elegível' : 'Faltam ' + elegibilidade}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveParticipant(participante.id)}
                            >
                              <Trash />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="certificados">
            <div className="bg-card rounded-md p-4">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">Certificados</h4>
                <span className="text-muted-foreground text-sm">
                  {getEligibleParticipants().length} elegível(is)
                </span>
              </div>

              {getEligibleParticipants().length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Nenhum participante atingiu o mínimo de presenças ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {getEligibleParticipants().map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="text-sm">{participant.nome}</div>
                      <Button
                        size="sm"
                        onClick={() =>
                          toast.success('O certificado está disponível', {
                            action: {
                              label: 'Acessar',
                              onClick: () =>
                                window.open(
                                  'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf'
                                ),
                            },
                          })
                        }
                      >
                        Gerar certificado
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="mt-4 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Apenados com não comparecimento</CardTitle>
                <CardDescription>
                  Participantes com ausências não justificadas em encontros realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getUnjustifiedAbsentees().length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Não há participantes com faltas não justificadas em encontros realizados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {getUnjustifiedAbsentees().map((participant) => (
                      <li
                        key={participant.id}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        {participant.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Declaração de conclusão</CardTitle>
                <CardDescription>Gerar declaração de conclusão do programa</CardDescription>
              </CardHeader>
              <CardContent>
                {getEligibleParticipants().length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhum participante elegível ainda.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {getEligibleParticipants().map((participant) => (
                      <li
                        key={participant.id}
                        className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        {participant.nome}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            {documentoDisponivel ? (
              <p className="text-muted-foreground">
                Clique{' '}
                <a
                  className="font-medium text-blue-700"
                  href="https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  aqui
                </a>{' '}
                para acessar o documento.
              </p>
            ) : (
              <Button
                disabled={getEligibleParticipants().length === 0}
                onClick={() => {
                  const url =
                    'https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf'
                  setDocumentoDisponivel(true)
                  toast.success('Documento disponível', {
                    action: {
                      label: 'Acessar',
                      onClick: () => window.open(url),
                    },
                  })
                }}
              >
                Gerar documentos da vara
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Registrar Presenças */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto lg:min-w-4xl" showCloseButton={true}>
          {selectedEncontro && (
            <>
              <DialogHeader>
                <DialogTitle>Registrar Presenças - {selectedEncontro.tema}</DialogTitle>
                <DialogDescription>Data: {formatDate(selectedEncontro.data)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {selectedEncontro.situacao === 'PENDENTE' && (
                  <div className="flex gap-3">
                    <Button
                      variant={encontroNewStatus === 'REALIZADO' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setEncontroNewStatus('REALIZADO')
                        setParticipantStatuses({})
                        setJustifications({})
                      }}
                      className="w-1/2"
                    >
                      Marcar como realizado
                    </Button>
                    <Button
                      variant={encontroNewStatus === 'CANCELADO' ? 'destructive' : 'outline'}
                      size="sm"
                      onClick={() => setEncontroNewStatus('CANCELADO')}
                      className="w-1/2"
                    >
                      Cancelar encontro
                    </Button>
                  </div>
                )}

                {encontroNewStatus === 'REALIZADO' && selectedEncontro.situacao === 'PENDENTE' && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tipo de justificação</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(group?.participantes || []).map((participant) => (
                          <TableRow key={participant.id}>
                            <TableCell className="font-medium">{participant.nome}</TableCell>
                            <TableCell>
                              <select
                                value={participantStatuses[participant.id] || ''}
                                onChange={(e) =>
                                  handleParticipantStatusChange(participant.id, e.target.value)
                                }
                                className={`rounded border px-2 py-1 text-xs ${
                                  participantStatuses[participant.id]
                                    ? getParticipantStatusColor(participantStatuses[participant.id])
                                    : 'border-gray-300 bg-white'
                                }`}
                              >
                                <option value="">Selecionar...</option>
                                <option value="PRESENTE">Presente</option>
                                <option value="AUSENTE">Ausente</option>
                                <option value="JUSTIFICADO">Justificado</option>
                              </select>
                            </TableCell>
                            <TableCell>
                              {participantStatuses[participant.id] === 'JUSTIFICADO' && (
                                <select
                                  value={justificationTypes[participant.id] || ''}
                                  onChange={(e) =>
                                    handleJustificationTypeChange(participant.id, e.target.value)
                                  }
                                  className="w-full rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                                >
                                  <option value="">Selecionar...</option>
                                  <option value="ATESTADO">Atestado médico</option>
                                  <option value="DETERMINACAO_JUDICIAL">
                                    Determinação judicial
                                  </option>
                                  <option value="FORCA_MAIOR">Força maior</option>
                                  <option value="OUTRO">Outro</option>
                                </select>
                              )}
                            </TableCell>
                            <TableCell>
                              {participantStatuses[participant.id] === 'JUSTIFICADO' && (
                                <div className="flex flex-col gap-1">
                                  <input
                                    type="text"
                                    placeholder="Digite a justificação (máx 200 caracteres)"
                                    maxLength={200}
                                    value={justifications[participant.id] || ''}
                                    onChange={(e) =>
                                      handleJustificationChange(participant.id, e.target.value)
                                    }
                                    className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                                  />
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {selectedEncontro.situacao === 'REALIZADO' && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tipo de Justificação</TableHead>
                          <TableHead>Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(group?.participantes || []).map((participant) => {
                          const status = selectedEncontro.presentes?.includes(participant.id)
                            ? 'PRESENTE'
                            : selectedEncontro.ausentes?.includes(participant.id)
                              ? 'AUSENTE'
                              : 'JUSTIFICADO'
                          const justificationData = selectedEncontro.justificacoes?.[participant.id]
                          const justificationType =
                            typeof justificationData === 'object' ? justificationData?.tipo : null
                          const justificationText =
                            typeof justificationData === 'object'
                              ? justificationData?.texto
                              : justificationData

                          return (
                            <TableRow key={participant.id}>
                              <TableCell className="font-medium">{participant.nome}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getParticipantStatusColor(situacao)}`}
                                >
                                  {status}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm">{justificationType || '-'}</TableCell>
                              <TableCell className="text-sm">{justificationText || '-'}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {encontroNewStatus && selectedEncontro.situacao === 'PENDENTE' && (
                  <div className="flex items-center gap-2 p-4">
                    <Checkbox
                      id="confirm-checkbox"
                      checked={isConfirmed}
                      onCheckedChange={setIsConfirmed}
                    />
                    <label htmlFor="confirm-checkbox" className="cursor-pointer text-sm">
                      Confirmo que estou registrando o encontro correto
                    </label>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closePresenceModal}>
                  {selectedEncontro.situacao === 'REALIZADO' ? 'Fechar' : 'Cancelar'}
                </Button>
                {selectedEncontro.situacao === 'PENDENTE' && encontroNewStatus && (
                  <Button onClick={handleConfirmPresences} disabled={isConfirmDisabled()}>
                    Salvar
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Encontro */}
      <Dialog open={isNewEncontroModalOpen} onOpenChange={setIsNewEncontroModalOpen}>
        <DialogContent className="max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Registrar Novo Encontro</DialogTitle>
            <DialogDescription>Preencha os dados do encontro que será realizado</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="encontro-data" className="mb-2 block text-sm font-medium">
                Data do Encontro
              </label>
              <input
                id="encontro-data"
                type="date"
                value={newEncontroData}
                onChange={(e) => setNewEncontroData(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="encontro-tema" className="mb-2 block text-sm font-medium">
                Tema do Encontro
              </label>
              <input
                id="encontro-tema"
                type="text"
                placeholder="Digite o tema"
                value={newEncontroTema}
                onChange={(e) => setNewEncontroTema(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeNewEncontroModal}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateEncontro}
              disabled={!newEncontroData || !newEncontroTema.trim()}
            >
              Criar encontro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Editar Encontro */}
      <Dialog open={isEditEncontroOpen} onOpenChange={setIsEditEncontroOpen}>
        <DialogContent className="max-w-md" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle>Editar Encontro</DialogTitle>
            <DialogDescription>
              Altere data e tema do encontro (PENDENTE). Administradores podem editar qualquer
              status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="edit-encontro-data" className="mb-2 block text-sm font-medium">
                Data do Encontro
              </label>
              <input
                id="edit-encontro-data"
                type="date"
                value={editEncontroData}
                onChange={(e) => setEditEncontroData(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="edit-encontro-tema" className="mb-2 block text-sm font-medium">
                Tema do Encontro
              </label>
              <input
                id="edit-encontro-tema"
                type="text"
                placeholder="Digite o tema"
                value={editEncontroTema}
                onChange={(e) => setEditEncontroTema(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditEncontroOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditEncontro}
              disabled={!editEncontroData || !editEncontroTema.trim()}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GroupManagement
