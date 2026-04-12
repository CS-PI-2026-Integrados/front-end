import React from 'react';
import {Users, FileText, CheckCircle, TriangleAlert} from 'lucide-react';
import {MetricCard} from '../components/dashboard/MetricCard.jsx'
import {ProofData} from "@/components/dashboard/ProofData.jsx";
import {RecentActivities} from "@/components/dashboard/RecentActivities.jsx";
import {useComarca} from "@/context/ComarcaContext.jsx";
import {mockApenados} from "@/mocks/apenados.mock.js";
import {mockPresenca} from "@/mocks/presenca.mock.js";



const Dashboard = () => {
    const {comarca} = useComarca();

    const apenados = mockApenados[comarca] || [];
    const presencas = mockPresenca[comarca] || [];

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
                        <MetricCard title="Total de apenados" value="247" description="Cadastrados no sistema"
                                    icon={<Users className="h-4 w-4 text-muted-foreground"/>}/>
                        <MetricCard title="Comprovantes emitidos" value="156" description="Total de comprovantes"
                                    icon={<FileText className="h-4 w-4 text-muted-foreground"/>}/>
                        <MetricCard title="Em conformidade" value="215" description="Situação regular"
                                    icon={<CheckCircle className="h-4 w-4 text-muted-foreground"/>}/>
                        <MetricCard title="Irregulares" value="32" description="Situação irregular"
                                    icon={<TriangleAlert
                                        className="h-4 w-4 text-muted-foreground"/>}/>
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