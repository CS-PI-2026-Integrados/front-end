import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { useSession } from '@/context/sessionContext'
import mockGroups from '@/mocks/grupos.mock.json'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
  const [searchGrupo, setSearchGrupo] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [grupoSelecionado, setGrupoSelecionado] = useState(null)
  const [visualizarGrupoAberto, setVisualizarGrupoAberto] = useState(false)

  const availableParticipants = useMemo(() => {
    const comarca = session?.tenant?.id
    if (!comarca) return []
    return mockGroups.filter((a) => a.tenant_id === comarca && a.status === 'Ativo')
  }, [session?.tenant?.id])

  const filteredGrupos = useMemo(() => {
    return grupos.filter((grupo) => {
      const matchesSearch = grupo.nomeGrupo?.toLowerCase().includes(searchGrupo.toLowerCase())
      const matchesStatus = statusFilter === 'TODOS' || grupo.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [grupos, searchGrupo, statusFilter])

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
    <div className="mx-auto min-h-screen max-w-7xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Grupos Reflexivos</h1>
            <p className="text-muted-foreground">
              Gerencie grupos de reflexão e acompanhe participantes
            </p>
          </div>

          <Button className="w-fit" type="button" onClick={() => setNovoGrupoAberto(true)}>
            <Plus className="h-4 w-4" />
            Novo Grupo
          </Button>
        </div>

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

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                <Input
                  placeholder="Buscar por nome do grupo..."
                  className="pl-10"
                  value={searchGrupo}
                  onChange={(e) => setSearchGrupo(e.target.value)}
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
            </div>

            <div className="rounded-md border">
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
                  {filteredGrupos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground h-32 text-center">
                        Nenhum grupo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGrupos.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell className="font-medium">{grupo.nomeGrupo}</TableCell>
                        <TableCell>
                          <Badge>{grupo.status}</Badge>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Groups
