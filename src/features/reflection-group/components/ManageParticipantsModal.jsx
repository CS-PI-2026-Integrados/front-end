import { useState } from 'react'
import { LoaderCircle, Plus, Trash2, X } from 'lucide-react'
import { useConvictedList } from '@/features/convicteds'
import { SearchPopover } from '@/shared/components/SearchPopover'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Spinner } from '@/shared/components/ui/spinner'
import { groupStatuses } from '../schemas/groupSchemas'

export function ManageParticipantsModal({
  open,
  onOpenChange,
  onRequestClose,
  group,
  participants = [],
  additions = [],
  removals = [],
  onAdd,
  onRemove,
  onCreateParticipant,
  onSave,
  onCancel,
  isLoading = false,
  isSaving = false,
  error,
  saveError,
  onRetry,
  readOnly = false,
  readOnlyReason = 'Este grupo está disponível somente para consulta.',
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isCreatingParticipant, setIsCreatingParticipant] = useState(false)
  const [creationError, setCreationError] = useState(null)
  const resetSearch = () => {
    setSearchOpen(false)
    setQuery('')
  }
  const requestClose = onRequestClose || (() => onOpenChange(false))
  const handleRequestClose = () => {
    resetSearch()
    requestClose()
  }
  const handleCancel = () => {
    resetSearch()
    onCancel?.()
    onOpenChange(false)
  }
  const participantIds = new Set(participants.map((person) => person.id))
  const search = useConvictedList({
    search: query.trim(),
    page: 1,
    limit: 20,
    enabled: open && searchOpen && Boolean(query.trim()) && !readOnly,
  })
  const availableParticipants = search.items.filter((person) => !participantIds.has(person.id))
  const hasChanges = additions.length > 0 || removals.length > 0
  const canEdit = !readOnly && !isLoading && !isSaving && !isCreatingParticipant
  const groupStatus = groupStatuses[group?.status] || group?.status || 'Status indisponível'
  const handleCreateParticipant = async () => {
    if (!onCreateParticipant || isCreatingParticipant) return
    setCreationError(null)
    resetSearch()
    setIsCreatingParticipant(true)
    try {
      const person = await onCreateParticipant()
      if (person && !participantIds.has(person.id)) {
        onAdd?.({
          id: person.id,
          fullName: person.fullName,
          cpf: person.cpf,
        })
      }
    } catch (cause) {
      setCreationError(cause.message || 'Não foi possível cadastrar o apenado.')
    } finally {
      setIsCreatingParticipant(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) onOpenChange(true)
        else handleRequestClose()
      }}
    >
      <DialogContent
        className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
        dismissOnEscapeKeyDown={!isSaving && !isCreatingParticipant}
      >
        <div className="relative border-b px-6 py-5 pr-14">
          <DialogHeader>
            <DialogTitle>Gerenciar participantes</DialogTitle>
            <DialogDescription>
              {group?.name || 'Grupo reflexivo'} · {groupStatus}
              <span className="mt-1 block">Inclua ou remova apenados e salve as alterações.</span>
            </DialogDescription>
          </DialogHeader>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 right-4"
            aria-label="Fechar gerenciamento de participantes"
            disabled={isSaving || isCreatingParticipant}
            onClick={handleRequestClose}
          >
            <X />
          </Button>
        </div>

        <div className="max-h-[calc(90dvh-13rem)] space-y-5 overflow-y-auto px-6 py-5">
          {!readOnly && (
            <section aria-label="Adicionar participante" className="space-y-2">
              <label className="text-sm font-medium" htmlFor="manage-participants-search">
                Adicionar apenado
              </label>
              <SearchPopover
                id="manage-participants-search"
                label="Adicionar apenado"
                placeholder="Selecione um apenado"
                searchPlaceholder="Buscar por nome ou CPF"
                open={searchOpen}
                onOpenChange={(nextOpen) => {
                  setSearchOpen(nextOpen)
                  if (!nextOpen) setQuery('')
                }}
                query={query}
                onQueryChange={setQuery}
                items={availableParticipants}
                isLoading={search.isLoading}
                error={search.error}
                emptyMessage="Nenhum apenado encontrado."
                loadingMessage="Buscando apenados..."
                closeOnSelect={false}
                disabled={!canEdit}
                footer={
                  onCreateParticipant && (
                    <div className="border-t p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-start"
                        disabled={!canEdit}
                        onClick={handleCreateParticipant}
                      >
                        <Plus />
                        Cadastrar novo apenado
                      </Button>
                    </div>
                  )
                }
                onSelect={(person) => {
                  if (participantIds.has(person.id)) return
                  onAdd?.({
                    id: person.id,
                    fullName: person.fullName,
                    cpf: person.cpf,
                  })
                }}
                renderItem={(person) => (
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{person.fullName}</span>
                    <span className="text-muted-foreground text-xs">{person.cpf}</span>
                  </div>
                )}
              />
              <p className="text-muted-foreground text-xs">
                Selecione um apenado para adicioná-lo à lista. As alterações só serão aplicadas ao
                salvar.
              </p>
              {creationError && (
                <p role="alert" className="text-destructive text-sm">
                  {creationError}
                </p>
              )}
              {isCreatingParticipant && (
                <p role="status" className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Spinner />
                  Aguardando o cadastro do apenado...
                </p>
              )}
            </section>
          )}

          {readOnly && (
            <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-sm">
              {readOnlyReason}
            </p>
          )}

          {isLoading ? (
            <div className="text-muted-foreground flex min-h-24 items-center justify-center gap-2 text-sm">
              <Spinner />
              Carregando participantes...
            </div>
          ) : error ? (
            <div role="alert" className="border-destructive/40 rounded-md border p-3">
              <p className="text-destructive text-sm">{error}</p>
              {onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={onRetry}
                >
                  Tentar novamente
                </Button>
              )}
            </div>
          ) : (
            <section aria-labelledby="selected-participants-heading" className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <h3 id="selected-participants-heading" className="text-sm font-medium">
                  Seleção atual
                </h3>
                <span className="text-muted-foreground text-xs">
                  {participants.length} participante{participants.length === 1 ? '' : 's'}
                </span>
              </div>
              {participants.length === 0 ? (
                <p className="text-muted-foreground rounded-md border border-dashed px-3 py-5 text-center text-sm">
                  Nenhum participante selecionado.
                </p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {participants.map((person) => {
                    const isNew = additions.some((item) => item.id === person.id)
                    return (
                      <li
                        key={person.id}
                        className="bg-muted/40 flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{person.fullName}</p>
                          {person.cpf && (
                            <p className="text-muted-foreground text-xs">{person.cpf}</p>
                          )}
                          {isNew && <span className="text-primary text-xs">Nova inclusão</span>}
                        </div>
                        {!readOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Remover ${person.fullName} da seleção`}
                            disabled={!canEdit}
                            onClick={() => onRemove?.(person.id)}
                          >
                            <Trash2 />
                            <span>Remover</span>
                          </Button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}

          {saveError && (
            <p role="alert" className="text-destructive text-sm">
              {saveError}
            </p>
          )}

          {!isLoading && !error && !readOnly && (
            <div
              aria-live="polite"
              className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            >
              {hasChanges ? (
                <>
                  <p className="font-medium">Resumo das alterações</p>
                  <p>
                    {additions.length} {additions.length === 1 ? 'inclusão' : 'inclusões'} e{' '}
                    {removals.length} {removals.length === 1 ? 'remoção' : 'remoções'}. As
                    alterações serão aplicadas somente ao salvar.
                  </p>
                </>
              ) : (
                <p>Nenhuma alteração pendente.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t px-6 py-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving || isCreatingParticipant}
          >
            Cancelar
          </Button>
          {!readOnly && (
            <Button
              type="button"
              onClick={() => {
                resetSearch()
                onSave?.()
              }}
              disabled={!hasChanges || !canEdit || Boolean(error) || !onSave}
              aria-busy={isSaving}
            >
              {isSaving && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
