import React, {useEffect} from 'react';
import {Users, FileText, CheckCircle, TriangleAlert} from 'lucide-react';
import {MetricCard} from '../components/dashboard/MetricCard.jsx'
import {ProofData} from "@/components/dashboard/ProofData.jsx";
import {RecentActivities} from "@/components/dashboard/RecentActivities.jsx";
import {useComarca} from "@/context/ComarcaContext.jsx";
import {mockApenados} from "@/mocks/apenados.mock.js";
import {mockPresenca} from "@/mocks/presenca.mock.js";
import {mockTenants} from "@/mocks/tenants.mock.js";
import { useParams} from 'react-router-dom';

function getTenantApenados(tenantId) {
    return mockApenados.apenados.filter(a => a.tenantId === tenantId);
}

const Dashboard = () => {
    const { tenantId } = useParams();
    const { setComarca } = useComarca();

    useEffect(() => {
        if(tenantId) {
            setComarca(tenantId);
        }
    }, [tenantId, setComarca]);
    
    const tenants = mockTenants.tenants || [];
    const apenados = mockApenados.apenados || [];
    const presencas = mockPresenca.presencas || [];

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const comprovantesRecentes = presencas.filter(presenca => new Date(presenca.dateTime) >= seteDiasAtras).length;

    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    
    const apenadosRegulares = getTenantApenados(tenants[0].id);
    console.log(apenadosRegulares);
    // const apenadosRegulares = apenados.filter(a => {
    //     const presencasDesseApenado = presencas.filter(p => if(a.tenantId === ) p.apenadoId === a.id);
    //     if (presencasDesseApenado.length === 0) return false;
    //     const datas = presencasDesseApenado.map((p) => new Date(p.dateTime).getTime());
    //     const ultimaPresenca = Math.max(...datas);
    //     return ultimaPresenca >= trintaDiasAtras.getTime();
    // });

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
                        data={apenadosRegulares.length}
                        icon={<CheckCircle className="h-4 w-4 text-muted-foreground"/>}/>
                    <MetricCard
                        title="Irregulares"
                        description="Situação irregular"
                        data={apenados.length - apenadosRegulares.length}
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