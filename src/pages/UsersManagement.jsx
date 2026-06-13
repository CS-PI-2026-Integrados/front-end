import { Search, UserCheck, UserCog, UserPlus, UserX, Users } from 'lucide-react'
import { useState } from 'react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { CreateOperatorDialog } from '@/components/users/CreateOperatorDialog'
import { UserDetailsPanel } from '@/components/users/UserDetailsPanel'
import { UsersTable } from '@/components/users/UsersTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUsersManagement, USERS_STATUS_FILTERS } from '@/hooks/useUsersManagement'

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Cadastro e controle de acesso dos operadores da comarca
          </p>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus />
          Novo Operador
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          icon={<UserCheck className="size-4 text-emerald-600" />}
        />
        <MetricCard
          title="Inativos"
          description="Com acesso bloqueado"
          data={metrics.inactive}
          icon={<UserX className="text-muted-foreground size-4" />}
        />
      </div>

      <section className="bg-card rounded-md border p-5 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold">Filtros</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Pesquise e filtre os usuários cadastrados
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 lg:flex-row">
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
            <SelectTrigger className="w-full lg:w-44">
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
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={USERS_STATUS_FILTERS.ALL}>Todos os Status</SelectItem>
              <SelectItem value={USERS_STATUS_FILTERS.ACTIVE}>Ativos</SelectItem>
              <SelectItem value={USERS_STATUS_FILTERS.INACTIVE}>Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="bg-card rounded-md border shadow-xs">
        <div className="flex items-center justify-between gap-3 p-5">
          <div>
            <h2 className="text-sm font-semibold">Usuários Cadastrados</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {filteredUsers.length} registro(s) encontrado(s)
            </p>
          </div>
          <UserCog className="text-muted-foreground size-5" />
        </div>

        {isLoading ? (
          <div className="text-muted-foreground flex min-h-48 items-center justify-center border-t text-sm">
            Carregando usuários...
          </div>
        ) : (
          <UsersTable
            onSelectUser={setSelectedUserId}
            selectedUserId={selectedUserId}
            users={filteredUsers}
          />
        )}
      </section>

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
