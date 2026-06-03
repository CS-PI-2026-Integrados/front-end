import { useState } from 'react'
import { Search, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

const Groups = () => {
  const [novoGrupoAberto, setNovoGrupoAberto] = useState(false)

  return (
    <div className="mx-auto max-w-7xl">
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

        <Dialog open={novoGrupoAberto} onOpenChange={setNovoGrupoAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Grupo</DialogTitle>
              <DialogDescription>
                Cadastre um novo grupo reflexivo para iniciar as atividades.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input placeholder="Nome do grupo" />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setNovoGrupoAberto(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={() => setNovoGrupoAberto(false)}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />

                <Input placeholder="Buscar por nome do grupo..." className="pl-10" />
              </div>

              <Select defaultValue="todos">
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="andamento">Em andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
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
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground h-32 text-center">
                      Nenhum grupo encontrado
                    </TableCell>
                  </TableRow>
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
