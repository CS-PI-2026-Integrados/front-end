import {Card, CardTitle, CardHeader, CardDescription, CardContent} from "@/components/ui/card.jsx";
import {Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts";


const data = [
    {name: "Jan", total: 12},
    {name: "Fev", total: 28},
    {name: "Mar", total: 24},
    {name: "Abr", total: 32},
    {name: "Mai", total: 26},
    {name: "Jun", total: 30},
];

export function ProofData() {
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
                        <BarChart data={data}>
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
                                radius={[4, 4, 0, 0]}
                                barSize={60}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}

