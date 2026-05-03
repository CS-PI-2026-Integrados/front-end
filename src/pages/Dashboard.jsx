import { useMemo } from 'react'
import { Users, FileText, CheckCircle, TriangleAlert } from 'lucide-react'
import { MetricCard } from '../components/dashboard/MetricCard.jsx'
import { ProofData } from '@/components/dashboard/ProofData.jsx'
import { RecentActivities } from '@/components/dashboard/RecentActivities.jsx'
import { useComarca } from '@/context/ComarcaContext.jsx'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { mockPresenca } from '@/mocks/presenca.mock.js'
import { mockTenants } from '@/mocks/tenants.mock.js'
import { useDashboardMetrics } from '@/lib/useDashboardMetrics.js'

const Dashboard = () => {
  const { comarca } = useComarca()

  const tenantAtual = useMemo(
    () => mockTenants.tenants.find((t) => t.uuid === comarca) || {},
    [comarca]
  )

  const apenados = useMemo(
    () => (mockApenados.apenados || []).filter((a) => a.tenantId === tenantAtual.id),
    [tenantAtual.id]
  )

  const presencas = useMemo(
    () => (mockPresenca.presencas || []).filter((p) => p.tenantId === tenantAtual.id),
    [tenantAtual.id]
  )

  const dashboardData = useDashboardMetrics(presencas, apenados)

  return (
    <div className="max-w-7x1 mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral</p>
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
            description="Nos últimos 7 dias"
            data={dashboardData.comprovantesRecentes}
            icon={<FileText className="text-muted-foreground h-4 w-4" />}
          />
          <MetricCard
            title="Em Conformidade"
            description="Situacão regular"
            data={dashboardData.apenadosRegulares}
            icon={<CheckCircle className="text-muted-foreground h-4 w-4" />}
          />
          <MetricCard
            title="Irregulares"
            description="Situação irregular"
            data={apenados.length - dashboardData.apenadosRegulares}
            icon={<TriangleAlert className="text-muted-foreground h-4 w-4" />}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <ProofData
              ultimosMesesGrafico={dashboardData.ultimosMesesGrafico}
              contagemMeses={dashboardData.contagemMeses}
            />
          </div>
          <div className="lg:col-span-2">
            <RecentActivities atividadesRecentes={dashboardData.atividadesRecentes} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
