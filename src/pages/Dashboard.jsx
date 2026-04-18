import React, {useEffect} from 'react';
import {Users, FileText, CheckCircle, TriangleAlert} from 'lucide-react';
import {MetricCard} from '../components/dashboard/MetricCard.jsx'
import {ProofData} from "@/components/dashboard/ProofData.jsx";
import {RecentActivities} from "@/components/dashboard/RecentActivities.jsx";
import {useComarca} from "@/context/ComarcaContext.jsx";
import {mockApenados} from "@/mocks/apenados.mock.js";
import {mockPresenca} from "@/mocks/presenca.mock.js";
import {mockTenants} from "@/mocks/tenants.mock.js";



function getTenantRegulares(tenantId, apenadosGlobais, presencasGlobais) {
   const apenadosDaComarca =  apenadosGlobais.filter(a => a.tenantId === tenantId);

    const limiteTempo = () => { 
        const trintaDias = new Date();
        trintaDias.setDate(trintaDias.getDate() - 30);
        return trintaDias.getTime();
    } 
   
   return apenadosDaComarca.filter(a => {
    const presencasApenado = presencasGlobais.filter(p => p.apenadoId === a.id);
    
    if (presencasApenado.length === 0) return false;
    const datas = presencasApenado.map((p) => new Date(p.dateTime).getTime());
    const ultimaPresenca = Math.max(...datas);
    return ultimaPresenca >= limiteTempo();
   });
}

function ultimosComprovantesEmitidos(tenantId, presencasGlobais) {
    const presencas = presencasGlobais.filter(p => p.tenantId === tenantId);
    const dataReferencia = () => {
        const seteDias = new Date();
        seteDias.setDate(seteDias.getDate() - 7);
        return seteDias.getTime();
    }
    return presencas.filter(p => new Date(p.dateTime).getTime() >= dataReferencia());
}

const Dashboard = () => {
    const {comarca} = useComarca();

    const tenants = mockTenants.tenants || [];
    const apenados = mockApenados.apenados || [];
    const presencas = mockPresenca.presencas || [];
    
    const tenantAtual = tenants.find(t => t.uuid === comarca);
    //vou ter um token que vai ser da pessoa. esse token vai identificar quem é a pessoa. a identifacção vai ver a lista de usuários e vai ver qual a comarca dela e apartir do login dela vamos fazer as queries.
 
    const apenadosRegulares = getTenantRegulares(tenantAtual?.id, apenados, presencas);
    const ultimosComprovantes = ultimosComprovantesEmitidos(tenantAtual?.id, presencas);
    console.log(apenadosRegulares);

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
                        data={ultimosComprovantes.length}
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