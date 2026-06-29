import { useEffect, useState } from 'react'
import { Users, FileText, CheckCircle, TriangleAlert, Plus } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { Spinner } from '@/components/ui/spinner'
import { MetricCard } from '../components/dashboard/MetricCard.jsx'
import { PageHeader } from '@/components/data-display/PageHeader'
import { Button } from '@/components/ui/button'
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

  const [isLoading, setLoading] = useState(false)
  const [group, setGroup] = useState(null)

  useEffect(() => {})

  return isLoading ? (
    <div className="flex h-full">
      <div className="m-auto">
        <Spinner />
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      <PageHeader
        title="Grupos Reflexivos"
        description="Gerencie grupos de reflexão e acompanhe participantes"
      />
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Participantes"
          description="Membros do grupo"
          data={10}
          icon={<Users className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Encontros"
          description="Realizados / Total"
          data={'5/10'}
          icon={<FileText className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Min. Presenças"
          description="Para certificação"
          data={10}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Elegíveis"
          description="Para certificado"
          data={5}
          icon={<TriangleAlert className="text-muted-foreground h-4 w-4" />}
        />
      </div>
    </div>
  )
}

export default GroupManagement
