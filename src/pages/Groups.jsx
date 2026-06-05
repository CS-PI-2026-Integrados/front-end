import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import mockApenados from '@/mocks/apenados.json'

import { Button } from '@/components/ui/button'
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

const Groups = () => {
  const { session } = useSession()
  const [novoGrupoAberto, setNovoGrupoAberto] = useState(false)
  const [grupos, setGrupos] = useState([])
  const [searchGrupo, setSearchGrupo] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  // Get available participants from session tenant
  const availableParticipants = useMemo(() => {
    const comarca = session?.tenant?.id
    if (!comarca) return []
    return mockApenados.filter((a) => a.tenant_id === comarca && a.status === 'Ativo')
  }, [session?.tenant?.id])

  const handleCreateGroup = async (formData) => {
    try {
      // Simulating API call - replace with actual API call
      const novoGrupo = {
        id: grupos.length + 1,
        ...formData,
        status: 'Planejamento',
        criadoEm: new Date().toISOString(),
      }

      setGrupos((prev) => [novoGrupo, ...prev])
      setNovoGrupoAberto(false)
    } catch (error) {
      throw error
    }
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
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Planejamento">Planejamento</SelectItem>
                  <SelectItem value="EmAndamento">Em andamento</SelectItem>
                  <SelectItem value="Concluido">Concluído</SelectItem>
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
                  {grupos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground h-32 text-center">
                        Nenhum grupo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    grupos.map((grupo) => (
                      <TableRow key={grupo.id}>
                        <TableCell className="font-medium">{grupo.nomeGrupo}</TableCell>
                        <TableCell>{grupo.status}</TableCell>
                        <TableCell>{grupo.participantes.length}</TableCell>
                        <TableCell>
                          {grupo.totalEncontros} ({grupo.frequencia})
                        </TableCell>
                        <TableCell>{grupo.dataInicio}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
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
      </div>
    </div>
  )
}

export default Groups
