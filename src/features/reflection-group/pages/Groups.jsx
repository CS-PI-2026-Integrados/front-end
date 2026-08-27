import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Users, Pencil, Trash, Settings } from 'lucide-react'
import { useSession } from '@/features/authentication/context/sessionContext'
import { useGroupsStorage } from '@/features/reflection-group/hooks/useGroupsStorage'
import { listarApenados } from '@/features/convicteds'
import { DataTableCard } from '@/shared/components/data-display/DataTableCard'
import { EmptyTableState } from '@/shared/components/data-display/EmptyTableState'
import { FiltersPanel } from '@/shared/components/data-display/FiltersPanel'
import { Button } from '@/shared/components/ui/button'
import { PageHeader } from '@/shared/components/data-display/PageHeader'
import { Input } from '@/shared/components/ui/input'
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
import { HeaderButton } from '@/shared/components/buttons/HeaderButton'
import { ConfirmationDialog } from '@/shared/components/ConfirmationDialog'

const Groups = () => {
  const { session } = useSession()
  const navigate = useNavigate()
  const [novoGrupoAberto, setNovoGrupoAberto] = useState(false)
  const { loadGroups, saveGroups } = useGroupsStorage()
  const [grupos, setGrupos] = useState(loadGroups)
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
      const groupStatus = grupo.situacao ?? grupo.status
      const matchesSituacao = situacaoFilter === 'TODOS' || groupStatus === situacaoFilter
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
      saveGroups(newGroupsList)
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
    saveGroups(newGroupsList)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Grupos reflexivos"
        description="Gerencie grupos de reflexão e acompanhe participantes"
        action={
          <HeaderButton icon={Plus} text="Novo Grupo" onClick={() => setNovoGrupoAberto(true)} />
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

        <Select value={situacaoFilter} onValueChange={setSituacaoFilter}>
          <SelectTrigger className="hover:bg-muted w-full cursor-pointer lg:w-44">
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
        <div className="overflow-x-auto">
          <Table className="min-w-190 text-sm">
            <TableHeader>
              <TableRow className="bg-secondary border-y">
                <TableHead className="px-4 py-3 text-left text-xs font-semibold">
                  Nome do Grupo
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold">Status</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold">
                  Participantes
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold">
                  Encontros
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold">Início</TableHead>
                <TableHead className="px-4 py-3 text-left text-xs font-semibold">Fim</TableHead>
                <TableHead className="px-4 py-3 text-right text-xs font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground h-32 px-4 text-center">
                    Nenhum grupo encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((grupo) => (
                  <TableRow
                    key={grupo.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleRowClick(grupo.id)}
                  >
                    <TableCell className="px-4 py-3 font-medium">{grupo.nome}</TableCell>
                    <TableCell className="px-4 py-3">
                      {
                        {
                          PLANEJAMENTO: 'Planejamento',
                          ANDAMENTO: 'Em andamento',
                          CONCLUIDO: 'Concluído',
                          CANCELADO: 'Cancelado',
                        }[grupo.situacao ?? grupo.status]
                      }
                    </TableCell>
                    <TableCell className="px-4 py-3">{grupo.participantes.length}</TableCell>
                    <TableCell className="px-4 py-3">
                      {grupo.totalEncontros} ({grupo.frequencia})
                    </TableCell>
                    <TableCell className="px-4 py-3">{formatDate(grupo.dataInicio)}</TableCell>
                    <TableCell className="px-4 py-3">{formatDate(grupo.dataTermino)}</TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleRowClick(grupo.id)
                        }}
                      >
                        Acessar
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <Settings />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <Button
                              size="xs"
                              variant="ghost"
                              className="w-full justify-start font-normal"
                              onClick={(event) => {
                                event.stopPropagation()
                                handleEditGroup(grupo)
                              }}
                            >
                              <Pencil /> Editar
                            </Button>
                            {session?.user.role?.level >= 2 ? (
                              <Button
                                size="xs"
                                variant="destructive"
                                className="w-full justify-start font-normal"
                                onClick={(event) => {
                                  event.stopPropagation()
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

      <ConfirmationDialog
        open={confirmExcluirAberto}
        onOpenChange={setConfirmExcluirAberto}
        title="Excluir grupo reflexivo"
        description={
          <>
            Tem certeza de que deseja excluir o grupo reflexivo{' '}
            <strong>{grupoParaExcluir?.nome}</strong>? Esta ação não pode ser desfeita.
          </>
        }
        destructive
        confirmLabel="Excluir"
        onConfirm={() => {
          if (grupoParaExcluir) {
            const newGroupsList = grupos.filter((item) => item.id !== grupoParaExcluir.id)
            setGrupos(newGroupsList)
            saveGroups(newGroupsList)
          }
          setGrupoParaExcluir(null)
        }}
      />
    </div>
  )
}

export default Groups
