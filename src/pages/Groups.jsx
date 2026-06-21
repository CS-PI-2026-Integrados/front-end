import { useState, useMemo, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import mockApenados from '@/mocks/apenados.json'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import ParticipantSelector from '@/components/hooks/ParticipantSelector'

const GroupViewModal = ({ group, isOpen, onOpenChange, availableParticipants, onUpdate }) => {
  const [editData, setEditData] = useState({ nomeGrupo: '', descricao: '', participantes: [] })
  const isEditable = group?.status === 'ANDAMENTO' || group?.status === 'PLANEJAMENTO'

  const handleOpenChange = (open) => {
    if (open && group) {
      setEditData({
        nomeGrupo: group.nomeGrupo ?? '',
        descricao: group.descricao ?? '',
        participantes: group.participantes ?? [],
      })
    }

    onOpenChange(open)
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleParticipantsChange = (participants) => {
    setEditData((prev) => ({ ...prev, participantes: participants }))
  }

  const handleSave = () => {
    if (!group) return
    onUpdate({ ...group, ...editData })
    onOpenChange(false)
  }

  if (!group) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes do grupo reflexivo</DialogTitle>
          <DialogDescription>
            Visualize e edite apenas nome, descrição e participantes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nomeGrupo">Nome do grupo</Label>
            <Input
              id="nomeGrupo"
              name="nomeGrupo"
              value={editData.nomeGrupo}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={editData.descricao}
              onChange={handleInputChange}
              disabled={!isEditable}
              className="resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={group.status} disabled />
            </div>
            <div className="space-y-2">
              <Label>Data de início</Label>
              <Input value={group.dataInicio} disabled />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Frequência</Label>
              <Input value={group.frequencia} disabled />
            </div>
            <div className="space-y-2">
              <Label>Dia da semana</Label>
              <Input value={group.diaSemana} disabled />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Horário</Label>
              <Input value={group.horario} disabled />
            </div>
            <div className="space-y-2">
              <Label>Total de encontros</Label>
              <Input value={String(group.totalEncontros)} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            <ParticipantSelector
              participants={editData.participantes}
              onParticipantsChange={handleParticipantsChange}
              availableParticipants={availableParticipants}
              disabled={!isEditable}
            />
          </div>

          {isEditable ? (
            <span></span>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>O status atual do grupo não permite a alteração .</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isEditable}>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const Groups = () => {
  const { session } = useSession()
  const [novoGrupoAberto, setNovoGrupoAberto] = useState(false)
  const [grupos, setGrupos] = useState([])
  const [searchGrupo, setSearchGrupo] = useState('')
  const [statusFilter, setStatusFilter] = useState('TODOS')
  const [grupoSelecionado, setGrupoSelecionado] = useState(null)
  const [visualizarGrupoAberto, setVisualizarGrupoAberto] = useState(false)

  const availableParticipants = useMemo(() => {
    const comarca = session?.tenant?.id
    if (!comarca) return []
    return mockApenados.filter((a) => a.tenant_id === comarca && a.status === 'Ativo')
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

  const handleOpenGroup = (grupo) => {
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
                        <TableCell>{grupo.status}</TableCell>
                        <TableCell>{grupo.participantes.length}</TableCell>
                        <TableCell>
                          {grupo.totalEncontros} ({grupo.frequencia})
                        </TableCell>
                        <TableCell>{grupo.dataInicio}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleOpenGroup(grupo)}>
                            Ver
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

        <GroupViewModal
          group={grupoSelecionado}
          isOpen={visualizarGrupoAberto}
          onOpenChange={setVisualizarGrupoAberto}
          availableParticipants={availableParticipants}
          onUpdate={handleUpdateGroup}
        />
      </div>
    </div>
  )
}

export default Groups
