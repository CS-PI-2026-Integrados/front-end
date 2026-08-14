import { Users, FileText, CheckCircle, TriangleAlert } from 'lucide-react'
import { MetricCard } from '@/features/dashboard/components/dashboard/MetricCard.jsx'
import { ProofData } from '@/features/dashboard/components/dashboard/ProofData.jsx'
import { RecentActivities } from '@/features/dashboard/components/dashboard/RecentActivities.jsx'
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics.js'
import { useDistrictData } from '@/features/dashboard/hooks/useDistrictData.js'

const Dashboard = () => {
  const { apenados, presencas } = useDistrictData()

  const {
    comprovantesRecentes,
    ultimosMesesGrafico,
    contagemMeses,
    apenadosRegulares,
    atividadesRecentes,
  } = useDashboardMetrics(presencas, apenados)

  return (
    <div className="max-w-7x1 mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">VisÃ£o geral</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total de apenados"
            description="Cadastrados no sistema"
            data={apenados.length}
            icon={<Users className="text-muted-foreground h-4 w-4" />}
          />
          <MetricCard
            title="Comprovantes emitidos"
            description="Nos Ãºltimos 7 dias"
            data={comprovantesRecentes}
            icon={<FileText className="text-muted-foreground h-4 w-4" />}
          />
          <MetricCard
            title="Em Conformidade"
            description="SituacÃ£o regular"
            data={apenadosRegulares}
            icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
          />
          <MetricCard
            title="Irregulares"
            description="SituaÃ§Ã£o irregular"
            data={apenados.length - apenadosRegulares}
            icon={<TriangleAlert className="text-muted-foreground h-4 w-4" />}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <ProofData ultimosMesesGrafico={ultimosMesesGrafico} contagemMeses={contagemMeses} />
          </div>
          <div className="lg:col-span-2">
            <RecentActivities atividadesRecentes={atividadesRecentes} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
