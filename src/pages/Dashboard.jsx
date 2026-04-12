import React from 'react';
import {MetricCard} from '../components/dashboard/MetricCard.jsx'

const Dashboard = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard title="Total de apenados" value="100" description="Cadastrados no sistema" icon = "👤" />
                <MetricCard title="Comprovantes emitidos" value="156" description="Total de comprovantes" icon="📝" />
                <MetricCard title="Em conformidade" value="215" description="Situação regular" icon="✔️"/>
                <MetricCard title="Irregulares" value="32" description="Situação irregular" icon="✖️"/>
            </div>
        </div>
    );
};

export default Dashboard;