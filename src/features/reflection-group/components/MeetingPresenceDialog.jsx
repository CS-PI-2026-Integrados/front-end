import { Button } from '@/shared/components/ui/button'
import { Checkbox } from '@/shared/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'

const JUSTIFICATION_LABELS = {
  ATESTADO: 'Atestado médico',
  DETERMINACAO_JUDICIAL: 'Determinação judicial',
  FORCA_MAIOR: 'Força maior',
  OUTRO: 'Outro',
}

const PARTICIPANT_STATUS_LABELS = {
  PRESENTE: 'Presente',
  AUSENTE: 'Ausente',
  JUSTIFICADO: 'Justificado',
}

const getParticipantStatusColor = (situacao) => {
  const statusColors = {
    PRESENTE: 'bg-green-900 text-green-200',
    AUSENTE: 'bg-red-600 text-red-200',
    JUSTIFICADO: 'bg-blue-600 text-blue-200',
  }
  return statusColors[situacao] || 'bg-gray-100 text-gray-800 border-gray-300'
}

const getMeetingAttendanceRows = (meeting, participants) => {
  if (Array.isArray(meeting.attendance)) {
    return meeting.attendance.map((record) => ({
      id: record.convictedId,
      fullName: record.convictedName,
      status: record.status,
      justificationType: record.justificationType,
      justificationText: record.justificationText,
    }))
  }

  return participants.map((participant) => {
    const justification = meeting.justifications?.[participant.id]
    return {
      id: participant.id,
      fullName: participant.fullName,
      status: meeting.present?.includes(participant.id)
        ? 'PRESENTE'
        : meeting.absent?.includes(participant.id)
          ? 'AUSENTE'
          : 'JUSTIFICADO',
      justificationType: typeof justification === 'object' ? justification?.type : null,
      justificationText: typeof justification === 'object' ? justification?.text : justification,
    }
  })
}

export function MeetingPresenceDialog({
  open,
  meeting,
  pertinentParticipants = [],
  canEdit = true,
  isSaving = false,
  formatDate,
  participantStatuses,
  justificationTypes,
  justifications,
  isConfirmed,
  isConfirmDisabled,
  error,
  onClose,
  onParticipantStatusChange,
  onJustificationTypeChange,
  onJustificationChange,
  onConfirmedChange,
  onConfirm,
}) {
  const isPending = meeting?.status === 'PENDENTE'
  const isEditable = Boolean(isPending && canEdit)
  const attendanceRows = meeting ? getMeetingAttendanceRows(meeting, pertinentParticipants) : []
  const hasPersistedRecords =
    Boolean(meeting) &&
    (meeting.status === 'REALIZADO' ||
      (meeting.attendance?.length ?? 0) > 0 ||
      (meeting.present?.length ?? 0) > 0 ||
      (meeting.absent?.length ?? 0) > 0 ||
      Object.keys(meeting.justifications ?? {}).length > 0)

  const title = isEditable
    ? `Registrar presenças - ${meeting?.subject}`
    : meeting?.status === 'CANCELADO'
      ? `Encontro não realizado - ${meeting?.subject}`
      : `Presenças registradas - ${meeting?.subject}`

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSaving) onClose()
      }}
    >
      <DialogContent
        className="max-h-[90vh] overflow-y-auto lg:min-w-4xl"
        showCloseButton={!isSaving}
        dismissOnEscapeKeyDown={!isSaving}
      >
        {meeting && (
          <>
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>Data: {formatDate(meeting.date)}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {meeting.status === 'CANCELADO' && (
                <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">
                  Este encontro está marcado como não realizado.
                </p>
              )}

              {isPending && !canEdit && (
                <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">
                  Seu perfil pode consultar os encontros, mas não pode registrar presenças.
                </p>
              )}

              {isEditable && (
                <>
                  {pertinentParticipants.length === 0 ? (
                    <p className="text-muted-foreground rounded-md border border-dashed px-4 py-6 text-center text-sm">
                      Nenhum participante vinculado para a data deste encontro.
                    </p>
                  ) : (
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
                          {pertinentParticipants.map((participant) => (
                            <TableRow key={participant.id}>
                              <TableCell className="font-medium">{participant.fullName}</TableCell>
                              <TableCell>
                                <Select
                                  value={participantStatuses[participant.id] || ''}
                                  onValueChange={(value) =>
                                    onParticipantStatusChange(participant.id, value)
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
                                      onJustificationTypeChange(participant.id, value)
                                    }
                                  >
                                    <SelectTrigger
                                      aria-label={`Justificação de ${participant.fullName}`}
                                    >
                                      <SelectValue placeholder="Selecionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(JUSTIFICATION_LABELS).map(
                                        ([value, label]) => (
                                          <SelectItem key={value} value={value}>
                                            {label}
                                          </SelectItem>
                                        )
                                      )}
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
                                        onJustificationChange(participant.id, e.target.value)
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

                  <div className="flex items-center gap-2 p-4">
                    <Checkbox
                      id="confirm-checkbox"
                      checked={isConfirmed}
                      onCheckedChange={onConfirmedChange}
                    />
                    <label htmlFor="confirm-checkbox" className="cursor-pointer text-sm">
                      Confirmo que estou registrando o encontro correto
                    </label>
                  </div>
                </>
              )}

              {!isEditable && hasPersistedRecords && (
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
                      {attendanceRows.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.fullName}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getParticipantStatusColor(record.status)}`}
                            >
                              {PARTICIPANT_STATUS_LABELS[record.status] || record.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            {JUSTIFICATION_LABELS[record.justificationType] ||
                              record.justificationType ||
                              '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {record.justificationText || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {isPending && !canEdit && !hasPersistedRecords && (
                <p className="text-muted-foreground text-sm">
                  Nenhuma presença registrada até o momento.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                {isEditable ? 'Cancelar' : 'Fechar'}
              </Button>
              {isEditable && (
                <Button onClick={onConfirm} disabled={isConfirmDisabled} aria-busy={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
