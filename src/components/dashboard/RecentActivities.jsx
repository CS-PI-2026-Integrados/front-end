import {Card, CardHeader, CardTitle, CardContent, CardDescription} from "@/components/ui/card.jsx";


// const listActivities = mockPresenca.

export function RecentActivities({atividadesRecentes}) {

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-bold">Atividades Recentes</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {atividadesRecentes?.length > 0 ? atividadesRecentes.map((a) => (
                        <div key={a.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0">
                            <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{a.apenadoName}</p>
                                <p className="text-sm text-muted-foreground">Comprovante: {a.verificationCode}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(a.dateTime).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground">Nenhuma atividade registrada.</p>
                    )}
                </div>

            </CardContent>
        </Card>
    );
}