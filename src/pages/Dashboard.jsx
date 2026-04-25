import {useMemo} from 'react';
import {Users, FileText, CheckCircle, TriangleAlert} from 'lucide-react';
import {MetricCard} from '../components/dashboard/MetricCard.jsx'
import {ProofData} from "@/components/dashboard/ProofData.jsx";
import {RecentActivities} from "@/components/dashboard/RecentActivities.jsx";
import {useComarca} from "@/context/ComarcaContext.jsx";
import {mockApenados} from "@/mocks/apenados.mock.js";
import {mockPresenca} from "@/mocks/presenca.mock.js";
import {mockTenants} from "@/mocks/tenants.mock.js";
import {useDashboardMetrics} from "@/lib/useDashboardMetrics.js";


const Dashboard = () => {
    const {comarca} = useComarca();

    const tenantAtual = useMemo(() => 
        mockTenants.tenants.find((t) => t.uuid === comarca) || {}
    , [comarca]);

    const apenados = useMemo(() => 
        (mockApenados.apenados || []).filter((a) => a.tenantId === tenantAtual.id)
    , [tenantAtual.id]);

    const presencas = useMemo(() => 
        (mockPresenca.presencas || []).filter((p) => p.tenantId === tenantAtual.id)
    , [tenantAtual.id]);

    const dashboardData = useDashboardMetrics(presencas, apenados);

    return (
        <div className="mx-auto max-w-7x1 p-6">
            <div className="space-y-6">
                {/*container header dashboard*/}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-muted-foreground">Visão geral</p>
                </div>

                {/*container grid metricas*/}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <MetricCard
                        title="Total de apenados"
                        description="Cadastrados no sistema"
                        data={apenados.length}
                        icon={<Users className="h-4 w-4 text-muted-foreground"/>}/>
                    <MetricCard
                        title="Comprovantes emitidos"
                        description="Nos últimos 7 dias"
                        data={dashboardData.comprovantesRecentes}
                        icon={<FileText className="h-4 w-4 text-muted-foreground"/>}/>
                    <MetricCard
                        title="Em Conformidade"
                        description="Situacão regular"
                        data={dashboardData.apenadosRegulares}
                        icon={<CheckCircle className="h-4 w-4 text-muted-foreground"/>}/>
                    <MetricCard
                        title="Irregulares"
                        description="Situação irregular"
                        data={apenados.length - dashboardData.apenadosRegulares}
                        icon={<TriangleAlert className="h-4 w-4 text-muted-foreground"/>}/>
                </div>

                {/*container grid dados*/}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                    <div className="lg:col-span-2">
                        <ProofData ultimosMesesGrafico={dashboardData.ultimosMesesGrafico} contagemMeses={dashboardData.contagemMeses}/>
                    </div>
                    <div className="lg:col-span-2">
                        <RecentActivities atividadesRecentes={dashboardData.atividadesRecentes} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard
