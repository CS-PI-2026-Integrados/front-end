import { Search, UserCheck, UserCog, UserPlus, UserX, Users } from 'lucide-react'
import { useState } from 'react'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { MetricCard } from '@/features/dashboard/components/dashboard/MetricCard'
import { CreateOperatorDialog } from '@/features/usuarios/components/users/CreateOperatorDialog'
import { UserDetailsPanel } from '@/features/usuarios/components/users/UserDetailsPanel'
import { UsersTable } from '@/features/usuarios/components/users/UsersTable'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import {
  useUsersManagement,
  USERS_STATUS_FILTERS,
} from '@/features/usuarios/hooks/useUsersManagement'

export default function UsersManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const {
    createOperator,
    currentUser,
    deactivateUser,
    filteredUsers,
    isLoading,
    metrics,
    reactivateUser,
    resetUserPassword,
    roleFilter,
    roleOptions,
    search,
    selectedUser,
    selectedUserId,
    setSearch,
    setRoleFilter,
    setSelectedUserId,
    setStatusFilter,
    statusFilter,
  } = useUsersManagement()

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gestão de Usuários"
        description="Cadastro e controle de acesso dos operadores da comarca"
        action={
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 min-w-40 cursor-pointer gap-2 px-4 text-sm font-medium shadow-sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <UserPlus />
            Novo Usuário
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total de usuários"
          description="Cadastrados na comarca"
          data={metrics.total}
          icon={<Users className="text-muted-foreground size-4" />}
        />
        <MetricCard
          title="Ativos"
          description="Com acesso habilitado"
          data={metrics.active}
          icon={<UserCheck className="text-muted-foreground size-4" />}
        />
        <MetricCard
          title="Inativos"
          description="Com acesso bloqueado"
          data={metrics.inactive}
          icon={<UserX className="text-muted-foreground size-4" />}
        />
      </div>

      <FiltersPanel description="Pesquise e filtre os usuários cadastrados">
        <div className="relative flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="pl-9"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou CPF..."
            value={search}
          />
        </div>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="hover:bg-muted w-full cursor-pointer lg:w-44">
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

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="hover:bg-muted w-full cursor-pointer lg:w-44">
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
        count={filteredUsers.length}
        icon={<UserCog className="text-muted-foreground size-5" />}
        isLoading={isLoading}
        loadingMessage="Carregando usuários..."
        isEmpty={filteredUsers.length === 0}
        emptyState={
          <EmptyTableState
            title="Nenhum usuário encontrado"
            description={
              search
                ? `Não há resultados para "${search}". Tente outro termo.`
                : 'A comarca ainda não possui usuários com esses filtros.'
            }
          />
        }
      >
        <UsersTable
          onSelectUser={setSelectedUserId}
          selectedUserId={selectedUserId}
          users={filteredUsers}
        />
      </DataTableCard>

      <UserDetailsPanel
        currentUser={currentUser}
        onClose={() => setSelectedUserId(null)}
        onDeactivate={deactivateUser}
        onReactivate={reactivateUser}
        onResetPassword={resetUserPassword}
        user={selectedUser}
      />

      <CreateOperatorDialog
        onCreate={createOperator}
        onOpenChange={setIsCreateDialogOpen}
        open={isCreateDialogOpen}
      />
    </div>
  )
}
