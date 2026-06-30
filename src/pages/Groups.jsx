import { useState, useMemo } from 'react'
import { Search, Plus, Users } from 'lucide-react'
import { useSession } from '@/context/sessionContext'
import mockGroups from '@/mocks/grupos.mock.json'
import { DataTableCard } from '@/components/data-display/DataTableCard'
import { EmptyTableState } from '@/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/components/data-display/FiltersPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import NewGroupForm from '@/components/hooks/NewGroupForm'
import GroupEditModal from '@/components/hooks/GroupEditModal'

const STORAGE_KEY = 'groups_list'

function getStoredList() {
  const salvo = localStorage.getItem(STORAGE_KEY)

  if (!salvo) return mockGroups

  try {
    const parsed = JSON.parse(salvo)

    return Array.isArray(parsed) ? parsed : mockGroups
  } catch {
    return mockGroups
  }
}

const Groups = () => {
  const { session } = useSession()
  const [novoGrupoAberto, setNovoGrupoAberto] = useState(false)
  const [grupos, setGrupos] = useState(getStoredList)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [grupoSelecionado, setGrupoSelecionado] = useState(null)
  const [visualizarGrupoAberto, setVisualizarGrupoAberto] = useState(false)

  const availableParticipants = useMemo(() => {
    const comarca = session?.tenant?.id
    if (!comarca) return []
    return mockGroups.filter((a) => a.tenant_id === comarca && a.status === 'Ativo')
  }, [session?.tenant?.id])

  const filtered = useMemo(() => {
    return grupos.filter((grupo) => {
      const matchesSearch = grupo.nomeGrupo?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'TODOS' || grupo.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [grupos, search, statusFilter])

  const handleCreateGroup = async (formData) => {
    try {
      const novoGrupo = {
        id: grupos.length + 1,
        ...formData,
        status: 'PLANEJAMENTO',
        criadoEm: new Date().toISOString(),
      }

      setGrupos((prev) => [novoGrupo, ...prev])
      setNovoGrupoAberto(false)
    } catch (error) {
      throw error
    }
  }

  const handleEditGroup = (grupo) => {
    setGrupoSelecionado(grupo)
    setVisualizarGrupoAberto(true)
  }

  const handleUpdateGroup = (updatedGrupo) => {
    setGrupos((prev) => prev.map((grupo) => (grupo.id === updatedGrupo.id ? updatedGrupo : grupo)))
  }

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        <PageHeader
          title="Grupos reflexivos"
          description="Gerencie grupos de reflexão e acompanhe participantes"
          action={
            <Button size="sm" onClick={() => setNovoGrupoAberto(true)}>
              <Plus />
              Novo grupo
            </Button>
          }
        />

        <NewGroupForm
          isOpen={novoGrupoAberto}
          onOpenChange={setNovoGrupoAberto}
          availableParticipants={availableParticipants}
          onSubmit={handleCreateGroup}
        />

        <GroupEditModal
          key={grupoSelecionado?.id ?? 'none'}
          group={grupoSelecionado}
          isOpen={visualizarGrupoAberto}
          onOpenChange={setVisualizarGrupoAberto}
          availableParticipants={availableParticipants}
          onUpdate={handleUpdateGroup}
        />

        <FiltersPanel description="Pesquise e filtre os grupos cadastrados">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setCurrentPage(1)
              }}
              className="pl-9"
            />
          </div>

          <Select defaultValue={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value="PLANEJAMENTO">Planejamento</SelectItem>
              <SelectItem value="ANDAMENTO">Em andamento</SelectItem>
              <SelectItem value="CONCLUIDO">Concluído</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </FiltersPanel>

        <DataTableCard
          title="Grupos cadastrados"
          count={filtered.length}
          icon={<Users className="text-muted-foreground size-5" />}
          isEmpty={filtered.length === 0}
          emptyState={
            <EmptyTableState
              title="Nenhum apenado encontrado"
              description={
                search
                  ? `Não há resultados para "${search}". Tente outro termo.`
                  : 'Não há grupos cadastrados com esses filtros.'
              }
            />
          }
        >
          <div className="px-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Grupo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Participantes</TableHead>
                  <TableHead>Encontros</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground h-32 text-center">
                      Nenhum grupo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((grupo) => (
                    <TableRow key={grupo.id}>
                      <TableCell className="font-medium">{grupo.nomeGrupo}</TableCell>
                      <TableCell>
                        <Badge>
                          {
                            {
                              PLANEJAMENTO: 'Planejamento',
                              ANDAMENTO: 'Em andamento',
                              CONCLUIDO: 'Concluído',
                              CANCELADO: 'Cancelado',
                            }[grupo.status]
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>{grupo.participantes.length}</TableCell>
                      <TableCell>
                        {grupo.totalEncontros} ({grupo.frequencia})
                      </TableCell>
                      <TableCell>{grupo.dataInicio}</TableCell>
                      <TableCell>{grupo.dataTermino}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditGroup(grupo)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </DataTableCard>
      </div>
    </div>
  )
}

export default Groups
