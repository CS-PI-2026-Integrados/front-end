import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users, Pencil, Trash, Settings } from 'lucide-react'
import { useSession } from '@/features/authentication/context/sessionContext'
import { listarGrupos, salvarGrupos } from '@/features/reflection-group/services/groupsService'
import { listarApenados } from '@/features/convicteds'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { Button } from '@/shared/components/ui/button'
import { Badge } from '@/shared/components/ui/badge'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Input } from '@/shared/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
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
import NewGroupForm from '@/features/reflection-group/components/hooks/NewGroupForm'
import GroupEditModal from '@/features/reflection-group/components/hooks/GroupEditModal'

function getStoredList() {
  const salvo = null

  if (!salvo) return listarGrupos()

  try {
    const parsed = JSON.parse(salvo)

    return Array.isArray(parsed) ? parsed : listarGrupos()
  } catch {
    return mockGroups
  }
}

const Groups = () => {
  const { session } = useSession()
  const navigate = useNavigate()
  const [novoGrupoAberto, setNovoGrupoAberto] = useState(false)
  const [grupos, setGrupos] = useState(getStoredList)
  const [search, setSearch] = useState('')
  const [situacaoFilter, setSituacaoFilter] = useState('TODOS')
  const [grupoSelecionado, setGrupoSelecionado] = useState(null)
  const [visualizarGrupoAberto, setVisualizarGrupoAberto] = useState(false)
  const [grupoParaExcluir, setGrupoParaExcluir] = useState(null)
  const [confirmExcluirAberto, setConfirmExcluirAberto] = useState(false)

  const availableParticipants = useMemo(() => {
    const comarca = session?.tenant?.id ? String(session.tenant.id) : ''
    if (!comarca) return listarApenados().filter((a) => a.status === 'Ativo')
    return listarApenados().filter((a) => String(a.tenantId) === comarca && a.status === 'Ativo')
  }, [session?.tenant?.id])

  const formatDate = (date) => {
    try {
      return new Date(date).toLocaleDateString()
    } catch {
      return ''
    }
  }

  const filtered = useMemo(() => {
    return grupos.filter((grupo) => {
      const matchesSearch = grupo.nome?.toLowerCase().includes(search.toLowerCase())
      const matchesSituacao = situacaoFilter === 'TODOS' || grupo.situacao === situacaoFilter
      return matchesSearch && matchesSituacao
    })
  }, [grupos, search, situacaoFilter])

  const handleCreateGroup = async (formData) => {
    try {
      const novoGrupo = {
        id: grupos.length + 1,
        ...formData,
        situacao: 'PLANEJAMENTO',
        criadoEm: new Date().toISOString(),
      }

      const newGroupsList = [novoGrupo, ...grupos]
      setGrupos(newGroupsList)
      salvarGrupos(newGroupsList)
      setNovoGrupoAberto(false)
    } catch (error) {
      throw error
    }
  }

  const handleEditGroup = (grupo) => {
    setGrupoSelecionado(grupo)
    setVisualizarGrupoAberto(true)
  }

  const handleRowClick = (id) => {
    navigate(`/grupos-reflexivos/${id}`)
  }

  const handleUpdateGroup = (updatedGrupo) => {
    const newGroupsList = grupos.map((grupo) =>
      grupo.id === updatedGrupo.id ? updatedGrupo : grupo
    )
    setGrupos(newGroupsList)
    salvarGrupos(newGroupsList)
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
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
            />
          </div>

          <Select defaultValue={situacaoFilter} onValueChange={setSituacaoFilter}>
            <SelectTrigger className="w-full md:w-55">
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
              title="Nenhum grupo reflexivo encontrado"
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
                    <TableCell colSpan={7} className="text-muted-foreground h-32 text-center">
                      Nenhum grupo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((grupo) => (
                    <TableRow key={grupo.id} tabIndex={0} role="button">
                      <TableCell className="font-medium">{grupo.nome}</TableCell>
                      <TableCell>
                        <Badge>
                          {
                            {
                              PLANEJAMENTO: 'Planejamento',
                              ANDAMENTO: 'Em andamento',
                              CONCLUIDO: 'Concluído',
                              CANCELADO: 'Cancelado',
                            }[grupo.situacao]
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>{grupo.participantes.length}</TableCell>
                      <TableCell>
                        {grupo.totalEncontros} ({grupo.frequencia})
                      </TableCell>
                      <TableCell>{formatDate(grupo.dataInicio)}</TableCell>
                      <TableCell>{formatDate(grupo.dataTermino)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleRowClick(grupo.id)}>
                          Acessar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <Settings />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuGroup>
                              <Button
                                size="xs"
                                variant="ghost"
                                className="w-full justify-start font-normal"
                                onClick={() => handleEditGroup(grupo)}
                              >
                                <Pencil /> Editar
                              </Button>
                              {session?.user.role?.level >= 2 ? (
                                <Button
                                  size="xs"
                                  variant="destructive"
                                  className="w-full justify-start font-normal"
                                  onClick={() => {
                                    setGrupoParaExcluir(grupo)
                                    setConfirmExcluirAberto(true)
                                  }}
                                >
                                  <Trash /> Excluir
                                </Button>
                              ) : null}
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
        </DataTableCard>

        <Dialog open={confirmExcluirAberto} onOpenChange={setConfirmExcluirAberto}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Excluir grupo reflexivo</DialogTitle>
              <DialogDescription>
                Tem certeza de que deseja excluir o grupo reflexivo{' '}
                <strong>{grupoParaExcluir?.nome}</strong>? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmExcluirAberto(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (grupoParaExcluir) {
                    const newGroupsList = grupos.filter((item) => item.id !== grupoParaExcluir.id)
                    setGrupos(newGroupsList)
                    salvarGrupos(newGroupsList)
                  }
                  setConfirmExcluirAberto(false)
                  setGrupoParaExcluir(null)
                }}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Groups
