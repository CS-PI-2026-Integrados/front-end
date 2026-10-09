import { Search, UserCog, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { CreateOperatorDialog } from '@/features/users/components/users/CreateOperatorDialog'
import { UserActionConfirmDialog } from '@/features/users/components/users/UserActionConfirmDialog'
import { ResetUserPasswordDialog } from '@/features/users/components/users/ResetUserPasswordDialog'
import { maskCpf } from '@/features/users/utils/userFormattersUtils'
import { UsersTable } from '@/features/users/components/users/UsersTable'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { Pagination } from '@/shared/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { useUsersManagement, USERS_STATUS_FILTERS } from '@/features/users/hooks/useUsersManagement'
import { HeaderButton } from '@/shared/components/buttons/HeaderButton'

export default function UsersManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [pendingAction, setPendingAction] = useState(null)
  const {
    createOperator,
    currentUser,
    deactivateUser,
    filteredUsers,
    isLoading,
    error,
    reload,
    scope,
    isSaving,
    mutationError,
    clearMutationError,
    reactivateUser,
    resetUserPassword,
    roleFilter,
    roleOptions,
    search,
    setSearch,
    setRoleFilter,
    setStatusFilter,
    statusFilter,
  } = useUsersManagement()
  const action = pendingAction?.scope === scope ? pendingAction : null
  const closeAction = (open) => {
    if (!open && !isSaving) {
      setPendingAction(null)
      clearMutationError()
    }
  }
  const confirmStatusAction = async () => {
    try {
      if (action.type === 'deactivate') await deactivateUser(action.user)
      else await reactivateUser(action.user)
    } catch {
      return false
    }
  }

  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearchChange = (value) => {
    setPage(1)
    setSearch(value)
  }

  const handleRoleFilterChange = (value) => {
    setPage(1)
    setRoleFilter(value)
  }

  const handleStatusFilterChange = (value) => {
    setPage(1)
    setStatusFilter(value)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gestão de Usuários"
        description="Cadastro e controle de acesso dos operadores da comarca"
        action={
          <HeaderButton
            icon={UserPlus}
            text="Novo Usuário"
            disabled={isSaving || isLoading || Boolean(error)}
            onClick={() => setIsCreateDialogOpen(true)}
          />
        }
      />

      <FiltersPanel description="Pesquise e filtre os usuários cadastrados">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Buscar usuário por nome ou CPF"
            className="pl-9"
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Buscar por nome ou CPF..."
            value={search}
          />
        </div>

        <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
          <SelectTrigger
            aria-label="Filtrar por nível de acesso"
            className="hover:bg-muted w-full cursor-pointer lg:w-44"
          >
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Níveis</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger
            aria-label="Filtrar por status"
            className="hover:bg-muted w-full cursor-pointer lg:w-44"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={USERS_STATUS_FILTERS.ALL}>Todos os Status</SelectItem>
            <SelectItem value={USERS_STATUS_FILTERS.ACTIVE}>Ativos</SelectItem>
            <SelectItem value={USERS_STATUS_FILTERS.INACTIVE}>Inativos</SelectItem>
          </SelectContent>
        </Select>
      </FiltersPanel>

      <DataTableCard
        title="Usuários Cadastrados"
        count={error ? undefined : filteredUsers.length}
        icon={<UserCog className="text-muted-foreground size-5" />}
        isLoading={isLoading}
        loadingMessage="Carregando usuários..."
        isEmpty={Boolean(error) || filteredUsers.length === 0}
        emptyState={
          error ? (
            <div
              role="alert"
              className="flex min-h-48 flex-col items-center justify-center gap-3 border-t p-6 text-center"
            >
              <p className="text-destructive text-sm">{error}</p>
              <Button variant="outline" onClick={reload}>
                Tentar novamente
              </Button>
            </div>
          ) : (
            <EmptyTableState
              title="Nenhum usuário encontrado"
              description={
                search
                  ? `Não há resultados para "${search}". Tente outro termo.`
                  : 'A comarca ainda não possui usuários com esses filtros.'
              }
            />
          )
        }
        footer={
          <div className="text-muted-foreground flex flex-col gap-3 border-t px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-medium">
              Página {currentPage} de {totalPages} · {filteredUsers.length} registros
            </span>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        }
      >
        <UsersTable
          currentUser={currentUser}
          isSaving={isSaving}
          onAction={(type, user) => {
            clearMutationError()
            setPendingAction({ type, user, scope })
          }}
          users={paginatedUsers}
        />
      </DataTableCard>

      {action?.type === 'reset-password' && (
        <ResetUserPasswordDialog
          key={`${scope}:${action.user.id}`}
          open
          user={action.user}
          error={mutationError}
          onConfirm={() => resetUserPassword(action.user)}
          onOpenChange={closeAction}
        />
      )}
      {action && action.type !== 'reset-password' && (
        <UserActionConfirmDialog
          open
          title={action.type === 'deactivate' ? 'Desativar usuário' : 'Reativar usuário'}
          actionLabel={action.type === 'deactivate' ? 'Desativar usuário' : 'Reativar usuário'}
          description={
            action.type === 'deactivate'
              ? `Desativar o acesso de ${action.user.name}, CPF ${maskCpf(action.user.cpf)}? O acesso será bloqueado.`
              : `Restaurar o acesso de ${action.user.name}?`
          }
          isDestructive={action.type === 'deactivate'}
          error={mutationError}
          onConfirm={confirmStatusAction}
          onOpenChange={closeAction}
        />
      )}

      <CreateOperatorDialog
        key={scope}
        onCreate={createOperator}
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />
    </div>
  )
}
