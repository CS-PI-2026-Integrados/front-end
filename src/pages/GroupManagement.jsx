import { useEffect, useState } from 'react'
import { Users, FileText, CheckCircle, TriangleAlert, Plus } from 'lucide-react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { MetricCard } from '../components/dashboard/MetricCard.jsx'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import mock from '@/mocks/grupos.mock.json'

const STORAGE_KEY = 'groups_list'

function getStoredList() {
  const local = localStorage.getItem(STORAGE_KEY)

  if (!local) return mock

  try {
    const parsed = JSON.parse(local)

    return Array.isArray(parsed) ? parsed : mock
  } catch {
    return mock
  }
}

const GroupManagement = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [isLoading, setLoading] = useState(false)
  const [group, setGroup] = useState(null)

  useEffect(() => {
    setLoading(true)

    try {
      const list = getStoredList()
      const gid = Number(id)
      const found = list.find((g) => String(g.id) === String(id) || g.id === gid)

      if (!found) {
        navigate('/grupos-reflexivos', { replace: true })
        return
      }

      setGroup(found)
    } catch (err) {
      navigate('/grupos-reflexivos', { replace: true })
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  return isLoading ? (
    <div className="flex h-full">
      <div className="m-auto">
        <Spinner />
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      <PageHeader
        title={group?.nomeGrupo ?? 'Grupos Reflexivos'}
        description={
          group?.descricao ??
          group?.description ??
          'Gerencie grupos de reflexão e acompanhe participantes'
        }
      />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Participantes"
          description="Membros do grupo"
          data={group?.participantes?.length ?? 0}
          icon={<Users className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Encontros"
          description="Realizados / Total"
          data={`${group?.realizados ?? 0}/${group?.totalEncontros ?? 0}`}
          icon={<FileText className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Min. Presenças"
          description="Para certificação"
          data={group?.minimoEncontros ?? group?.minimoPresencas ?? 0}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Elegíveis"
          description="Para certificado"
          data={
            group?.participantes
              ? group.participantes.filter(
                  (p) =>
                    (p.presencas ?? 0) >= (group?.minimoEncontros ?? group?.minimoPresencas ?? 0)
                ).length
              : 0
          }
          icon={<TriangleAlert className="text-muted-foreground h-4 w-4" />}
        />
      </div>
      <div className="mt-6">
        <Tabs defaultValue="encontros">
          <TabsList>
            <TabsTrigger value="encontros">Encontros</TabsTrigger>
            <TabsTrigger value="participantes">Participantes</TabsTrigger>
            <TabsTrigger value="certificados">Certificados</TabsTrigger>
            <TabsTrigger value="documentos">Documentos Vara</TabsTrigger>
          </TabsList>

          <TabsContent value="encontros">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-medium">Histórico de encontros</h4>
              <Button size="sm">
                <Plus />
                Registrar encontro
              </Button>
            </div>

            <div className="bg-card rounded-md p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Presenças</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {(group?.encontros ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground h-32 text-center">
                        Nenhum encontro registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    (group.encontros || []).map((encontro) => (
                      <TableRow key={encontro.id}>
                        <TableCell>{encontro.data}</TableCell>
                        <TableCell className="max-w-[40ch] truncate">{encontro.tema}</TableCell>
                        <TableCell>
                          {`${encontro.presentes?.length ?? encontro.presencasCount ?? 0}/${group?.participantes?.length ?? 0}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="secondary" size="sm">
                            Registrar presença
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="participantes">
            {/* Painel de Participantes (não implementado) */}
          </TabsContent>

          <TabsContent value="certificados">
            {/* Painel de Certificados (não implementado) */}
          </TabsContent>

          <TabsContent value="documentos">
            {/* Painel de Documentos Vara (não implementado) */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default GroupManagement
