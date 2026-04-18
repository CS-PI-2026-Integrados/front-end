import React, {useMemo} from 'react';
import {Users, FileText, CheckCircle, TriangleAlert} from 'lucide-react';
import {MetricCard} from '../components/dashboard/MetricCard.jsx'
import {ProofData} from "@/components/dashboard/ProofData.jsx";
import {RecentActivities} from "@/components/dashboard/RecentActivities.jsx";
import {useComarca} from "@/context/ComarcaContext.jsx";
import {mockApenados} from "@/mocks/apenados.mock.js";
import {mockPresenca} from "@/mocks/presenca.mock.js";
import {mockTenants} from "@/mocks/tenants.mock.js";


const Dashboard = () => {
    const {comarca} = useComarca();

    const tenants = mockTenants.tenants || [];
    const apenados = mockApenados.apenados || [];
    const presencas = mockPresenca.presencas || [];

    const tenantAtual = tenants.find(t => t.uuid === comarca);

    const {apenadosRegulares, comprovantesRecentes} = useMemo(() => {
        const agora = Date.now();
        const limite7Dias = agora - (7 * 24 * 60 * 60 * 1000);
        const limite30Dias = agora - (30 * 24 * 60 * 60 * 1000);

        const ultimaPresenca = {};

        let recentes = 0;

        for (let i = 0; i < presencas.length; i++) {
            const p = presencas[i];
            const timestamp = new Date(p.dateTime).getTime();
            if (timestamp >= limite7Dias) recentes++;

            if (!ultimaPresenca[p.apenadoId] || timestamp > ultimaPresenca[p.apenadoId]) {
                ultimaPresenca[p.apenadoId] = timestamp;
            }
        }

        let regulares = 0;

        for (let i = 0; i < apenados.length; i++) {
            const ultimaData = ultimaPresenca[apenados[i].id];
            if (ultimaData && ultimaData >= limite30Dias) {
                regulares++
            }
        }

        return {apenadosRegulares: regulares, comprovantesRecentes: recentes};
    }, [apenados, presencas]);

    console.log(tenantAtual);
    //vou ter um token que vai ser da pessoa. esse token vai identificar quem é a pessoa. a identifacção vai ver a lista de usuários e vai ver qual a comarca dela e apartir do login dela vamos fazer as queries.

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
                        data={comprovantesRecentes}
                        icon={<FileText className="h-4 w-4 text-muted-foreground"/>}/>
                    <MetricCard
                        title="Em Conformidade"
                        description="Situacão regular"
                        data={apenadosRegulares}
                        icon={<CheckCircle className="h-4 w-4 text-muted-foreground"/>}/>
                    <MetricCard
                        title="Irregulares"
                        description="Situação irregular"
                        data={apenados.length - apenadosRegulares}
                        icon={<TriangleAlert className="h-4 w-4 text-muted-foreground"/>}/>
                </div>

                {/*container grid dados*/}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                    <div className="lg:col-span-2">
                        <ProofData/>
                    </div>
                    <div className="lg:col-span-2">
                        <RecentActivities/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;