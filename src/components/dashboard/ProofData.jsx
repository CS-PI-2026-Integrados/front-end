import {Card, CardTitle, CardHeader, CardDescription, CardContent} from "@/components/ui/card.jsx";
import {Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";


export function ProofData({ultimosMesesGrafico = [], contagemMeses = []}) {
    const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const dadosGrafico = ultimosMesesGrafico.map((numeroMes, index) => {
        return {
            name: nomesMeses[numeroMes],
            total: contagemMeses[index] || 0
        };
    }).reverse();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-bold">Comprovantes Mensais</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">Total de comprovantes emitidos por mês em
                    2024</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dadosGrafico}>
                            {/*grid horizontal*/}
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
                            <XAxis
                                dataKey="name"
                                axisLine={true}
                                tickLine={true}
                                tick={{fill: '#6b7280', fontSize: 12}}
                                dy={6}
                            />
                            <YAxis
                                allowDecimals={false}
                                axisLine={true}
                                tickLine={true}
                                tick={{fill: '#6b7280', fontSize: 12}}
                                dx={-6}
                            />

                            {/*tooltip*/}
                            <Tooltip
                                cursor={{fill: '#f3f4f6'}}
                                contentStyle={{
                                    borderRadius: '8px',
                                    border: 'none',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Bar
                                dataKey="total"
                                fill="#166534"
                                radius={[6, 6, 0, 0]}
                                barSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
