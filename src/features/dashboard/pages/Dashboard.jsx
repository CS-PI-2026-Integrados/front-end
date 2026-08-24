import { Users, FileText, CheckCircle, TriangleAlert } from 'lucide-react'
import { MetricCard } from '@/features/dashboard/components/dashboard/MetricCard.jsx'
import { ProofData } from '@/features/dashboard/components/dashboard/ProofData.jsx'
import { RecentActivities } from '@/features/dashboard/components/dashboard/RecentActivities.jsx'
import { useDashboardMetrics } from '@/features/dashboard/hooks/useDashboardMetrics.js'
import { useDistrictData } from '@/features/dashboard/hooks/useDistrictData.js'
import { PageHeader } from '@/shared/components/data-display/PageHeader'

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
    <div className="space-y-5">
      <PageHeader title="Dashboard" description="Visão geral" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de apenados"
          description="Cadastrados no sistema"
          data={apenados.length}
          icon={<Users className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Comprovantes emitidos"
          description="Nos últimos 7 dias"
          data={comprovantesRecentes}
          icon={<FileText className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Em Conformidade"
          description="Situacão regular"
          data={apenadosRegulares}
          icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
        />
        <MetricCard
          title="Irregulares"
          description="Situação irregular"
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
  )
}

export default Dashboard
