import { useState } from 'react'
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
import { useSession } from '@/features/authentication'
import { Spinner } from '@/shared/components/ui/spinner'
import { MetricCard } from '@/shared/components/data-display/MetricCard'
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
  DropdownMenuItem,
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
import { Checkbox } from '@/shared/components/ui/checkbox.jsx'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
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
    {situacao}
  </span>
)

const GroupConversation = ({ data }) => {
  const { session } = useSession()
  const [documentoDisponivel, setDocumentoDisponivel] = useState(false)
  const {
    isLoading,
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
  } = data
  if (!isLoading && !group)
    return (
      <div role="alert">
        <p>{error || 'Grupo não encontrado.'}</p>
        <Button onClick={reload}>Tentar novamente</Button>
      </div>
    )
  return isLoading ? (
    <div className="flex h-full">
      <div className="m-auto">
        <Spinner />
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      {error && !isModalOpen && !isNewEncontroModalOpen && !isEditEncontroOpen && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
      <PageHeader
        title={group?.name ?? 'Grupos Reflexivos'}
        description={group?.description ?? 'Gerencie grupos de reflexão e acompanhe participantes'}
      />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Participantes"
          description="Membros do grupo"
          data={group?.participants?.length ?? 0}
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
          data={group?.minimumMeetings ?? 0}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Elegíveis"
          description="Para certificado"
          data={getEligibleParticipants().length}
          icon={<TriangleAlert className="text-muted-foreground h-4 w-4" />}
        />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="encontros">
          <TabsList className="max-w-full justify-start overflow-x-auto overflow-y-hidden">
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
                  {(group?.meetings ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground h-32 text-center">
                        Nenhum encontro registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    (group.meetings || []).map((encontro) => (
                      <TableRow key={encontro.id}>
                        <TableCell>{formatDate(encontro.date) || null}</TableCell>
                        <TableCell className="max-w-[40ch] truncate">{encontro.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <StatusBadge situacao={encontro.status || 'PENDENTE'} />
                            {isEncontroAtrasado(encontro) && (
                              <span className="text-xs text-red-600/85">Registro em atraso</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {`${encontro.present?.length ?? encontro.attendanceCount ?? 0}/${group?.participants?.length ?? 0}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                aria-label={`Ações do encontro ${encontro.subject}`}
                              >
                                <Settings />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  disabled={
                                    (encontro.status !== 'PENDENTE' &&
                                      session?.user?.role?.key !== 'admin') ||
                                    !['admin', 'operator'].includes(session?.user?.role?.key)
                                  }
                                  className="w-full justify-start"
                                  onSelect={() => handleEditEncontro(encontro)}
                                >
                                  <Pencil /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="w-full justify-start"
                                  onSelect={() => openPresenceModal(encontro)}
                                  disabled={encontro.status === 'CANCELADO'}
                                  title={
                                    encontro.status === 'CANCELADO'
                                      ? 'Não é possível registrar presenças para encontros cancelados'
                                      : ''
                                  }
                                >
                                  <ListCheck />
                                  Presenças
                                </DropdownMenuItem>
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
                  {group?.participants?.length ?? 0} participante(s)
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
                  {(group?.participants ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground h-32 text-center">
                        Nenhum participante cadastrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    (group?.participants ?? []).map((participante) => {
                      const presencas = getParticipantPresencas(participante)
                      const faltas = getParticipantFaltas(participante)
                      const elegibilidade = getParticipantElegibilidade(participante)

                      return (
                        <TableRow key={participante.id}>
                          <TableCell className="font-medium">{participante.fullName}</TableCell>
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
                              disabled={isSaving}
                              aria-label={`Remover ${participante.fullName}`}
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
              <p className="text-muted-foreground mb-4 text-sm">
                Os arquivos desta prévia são documentos de demonstração.
              </p>

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
                      <div className="text-sm">{participant.fullName}</div>
                      <Button size="sm" asChild>
                        <a
                          href="https://s2.q4cdn.com/175719177/files/doc_presentations/Placeholder-PDF.pdf"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Gerar certificado
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="mt-4 flex flex-col gap-4">
            <p className="text-muted-foreground text-sm">
              Os arquivos desta prévia são documentos de demonstração.
            </p>
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
                        {participant.fullName}
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
                        {participant.fullName}
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
                para acessar o documento de demonstração.
              </p>
            ) : (
              <Button
                disabled={getEligibleParticipants().length === 0}
                onClick={() => setDocumentoDisponivel(true)}
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
                <DialogTitle>Registrar Presenças - {selectedEncontro.subject}</DialogTitle>
                <DialogDescription>Data: {formatDate(selectedEncontro.date)}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {selectedEncontro.status === 'PENDENTE' && (
                  <div className="flex gap-3">
                    <Button
                      variant={encontroNewStatus === 'REALIZADO' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setEncontroNewStatus('REALIZADO')
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

                {encontroNewStatus === 'REALIZADO' && selectedEncontro.status === 'PENDENTE' && (
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
                        {(group?.participants || []).map((participant) => (
                          <TableRow key={participant.id}>
                            <TableCell className="font-medium">{participant.fullName}</TableCell>
                            <TableCell>
                              <Select
                                value={participantStatuses[participant.id] || ''}
                                onValueChange={(value) =>
                                  handleParticipantStatusChange(participant.id, value)
                                }
                              >
                                <SelectTrigger aria-label={`Presença de ${participant.fullName}`}>
                                  <SelectValue placeholder="Selecionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PRESENTE">Presente</SelectItem>
                                  <SelectItem value="AUSENTE">Ausente</SelectItem>
                                  <SelectItem value="JUSTIFICADO">Justificado</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {participantStatuses[participant.id] === 'JUSTIFICADO' && (
                                <Select
                                  value={justificationTypes[participant.id] || ''}
                                  onValueChange={(value) =>
                                    handleJustificationTypeChange(participant.id, value)
                                  }
                                >
                                  <SelectTrigger
                                    aria-label={`Justificação de ${participant.fullName}`}
                                  >
                                    <SelectValue placeholder="Selecionar..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="ATESTADO">Atestado médico</SelectItem>
                                    <SelectItem value="DETERMINACAO_JUDICIAL">
                                      Determinação judicial
                                    </SelectItem>
                                    <SelectItem value="FORCA_MAIOR">Força maior</SelectItem>
                                    <SelectItem value="OUTRO">Outro</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                            <TableCell>
                              {participantStatuses[participant.id] === 'JUSTIFICADO' && (
                                <div className="flex flex-col gap-1">
                                  <Input
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

                {selectedEncontro.status === 'REALIZADO' && (
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
                        {(group?.participants || []).map((participant) => {
                          const status = selectedEncontro.present?.includes(participant.id)
                            ? 'PRESENTE'
                            : selectedEncontro.absent?.includes(participant.id)
                              ? 'AUSENTE'
                              : 'JUSTIFICADO'
                          const justificationData =
                            selectedEncontro.justifications?.[participant.id]
                          const justificationType =
                            typeof justificationData === 'object' ? justificationData?.type : null
                          const justificationText =
                            typeof justificationData === 'object'
                              ? justificationData?.text
                              : justificationData

                          return (
                            <TableRow key={participant.id}>
                              <TableCell className="font-medium">{participant.fullName}</TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getParticipantStatusColor(status)}`}
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

                {encontroNewStatus && selectedEncontro.status === 'PENDENTE' && (
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

              {error && (
                <p role="alert" className="text-destructive">
                  {error}
                </p>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={closePresenceModal}>
                  {selectedEncontro.status === 'REALIZADO' ? 'Fechar' : 'Cancelar'}
                </Button>
                {selectedEncontro.status === 'PENDENTE' && encontroNewStatus && (
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
              <Input
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
              <Input
                id="encontro-tema"
                type="text"
                placeholder="Digite o tema"
                value={newEncontroTema}
                onChange={(e) => setNewEncontroTema(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
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
              <Input
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
              <Input
                id="edit-encontro-tema"
                type="text"
                placeholder="Digite o tema"
                value={editEncontroTema}
                onChange={(e) => setEditEncontroTema(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
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

export default GroupConversation
