import { Pencil, Plus, Search, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeaderButton } from '@/shared/components/buttons/HeaderButton'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Pagination } from '@/shared/components/ui/pagination'
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
import { useGroups } from '../hooks/useGroups'
import { groupFrequencies, groupStatuses } from '../schemas/groupSchemas'
import GroupEditModal from '../components/GroupEditModal'
import NewGroupForm from '../components/NewGroupForm'

const formatDate = (value) => (value ? value.slice(0, 10).split('-').reverse().join('/') : '—')
const formatMeetings = (total, frequency) => {
  const label = groupFrequencies[frequency]
  if (total == null && !label) return '—'
  if (total == null) return label
  if (!label) return String(total)
  return `${total} (${label})`
}

export default function Groups() {
  const [name, setName] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const data = useGroups({ name, status, page })
  return (
    <div className="space-y-5">
      <PageHeader
        title="Grupos reflexivos"
        description="Gerencie grupos de reflexão e acompanhe participantes"
        action={
          data.canManage && (
            <HeaderButton icon={Plus} text="Novo Grupo" onClick={() => setCreating(true)} />
          )
        }
      />
      <NewGroupForm
        isOpen={creating}
        onOpenChange={setCreating}
        isSaving={data.isSaving}
        onSubmit={async (input) => {
          await data.mutate('create', input)
          setCreating(false)
        }}
      />
      {editingGroup && (
        <GroupEditModal
          group={editingGroup}
          isOpen
          onOpenChange={(open, possiblyChanged) => {
            if (!open) {
              setEditingGroup(null)
              if (possiblyChanged) data.reload()
            }
          }}
          isSaving={data.isSaving}
          onUpdate={async (input) => {
            await data.mutate('saveChanges', editingGroup.id, input)
            setEditingGroup(null)
          }}
        />
      )}
      <FiltersPanel description="Pesquise e filtre os grupos cadastrados">
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Buscar grupo por nome"
            placeholder="Buscar por nome..."
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status || 'ALL'}
          onValueChange={(value) => {
            setStatus(value === 'ALL' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger
            aria-label="Filtrar por status"
            className="hover:bg-muted w-full cursor-pointer lg:w-44"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            {Object.entries(groupStatuses).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FiltersPanel>
      {data.error ? (
        <div role="alert" className="text-destructive">
          {data.error}{' '}
          <Button variant="outline" onClick={data.reload}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <DataTableCard
          title="Grupos cadastrados"
          count={data.totalItems}
          icon={<Users className="text-muted-foreground size-5" />}
          isLoading={data.isLoading}
          isEmpty={!data.items.length}
          emptyState={
            <EmptyTableState
              title="Nenhum grupo reflexivo encontrado"
              description={
                name
                  ? `Não há resultados para "${name}". Tente outro termo.`
                  : 'Não há grupos cadastrados com esses filtros.'
              }
            />
          }
          footer={
            <div className="text-muted-foreground flex flex-col gap-3 border-t px-4 py-3.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <span className="font-medium">
                Página {page} de {data.totalPages} · {data.totalItems} registros
              </span>
              <Pagination currentPage={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          }
        >
          <Table contentColumns="fit-content(36ch) max-content max-content max-content max-content max-content max-content">
            <TableHeader>
              <TableRow className="bg-secondary border-y">
                {['Nome do Grupo', 'Status', 'Participantes', 'Encontros', 'Início', 'Fim'].map(
                  (title) => (
                    <TableHead key={title} className="px-4 py-3 text-left text-xs font-semibold">
                      {title}
                    </TableHead>
                  )
                )}
                <TableHead className="px-4 py-3 text-right text-xs font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="min-w-56 px-4 py-3 font-medium wrap-break-word whitespace-normal">
                    {group.name}
                  </TableCell>
                  <TableCell className="px-4 py-3">{groupStatuses[group.status]}</TableCell>
                  <TableCell className="px-4 py-3">{group.participantCount}</TableCell>
                  <TableCell className="px-4 py-3">
                    {formatMeetings(group.totalMeetingsCount, group.frequency)}
                  </TableCell>
                  <TableCell className="px-4 py-3">{formatDate(group.startDate)}</TableCell>
                  <TableCell className="px-4 py-3">
                    {formatDate(group.realEndDate || group.predictedEndDate)}
                  </TableCell>
                  <TableCell className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild size="sm">
                        <Link to={`/grupos-reflexivos/${group.id}`}>Acessar</Link>
                      </Button>
                      {data.canManage && (
                        <Button
                          type="button"
                          title="Editar"
                          variant="ghost"
                          size="icon-sm"
                          onClick={async () => {
                            try {
                              const full = await groupsService.getById(group.id)
                              setEditingGroup(full)
                            } catch {
                              setEditingGroup(group)
                            }
                          }}
                        >
                          <Pencil />
                          <span className="sr-only">Editar</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTableCard>
      )}
    </div>
  )
}
