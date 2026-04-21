import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card.jsx";

export function RecentActivities({ atividadesRecentes }) {
    const atividadesFormatadas = useMemo(() => {
        if (!atividadesRecentes || !Array.isArray(atividadesRecentes)) return [];

        const agoraMs = new Date().getTime();
        const umMinuto = 60 * 1000;
        const umaHora = 60 * umMinuto;
        const umDia = 24 * umaHora;
        const umMes = 30 * umDia;
        const umAno = 365 * umDia;

        return atividadesRecentes.slice(0, 4).map((a) => {
            const ms = new Date(a.dateTime).getTime();
            const diferenca = agoraMs - ms;
            let tempoRelativo = "";

            if (isNaN(ms) || ms > agoraMs) {
                tempoRelativo = "Agora mesmo";
            } else if (diferenca < umaHora) {
                const literal = Math.max(0, Math.floor(diferenca / umMinuto));
                tempoRelativo = `${literal} min`;
            } else if (diferenca < umDia) {
                const literal = Math.floor(diferenca / umaHora);
                tempoRelativo = `${literal} ${literal > 1 ? "horas" : "hora"}`;
            } else if (diferenca < umMes) {
                const literal = Math.floor(diferenca / umDia);
                tempoRelativo = `${literal} ${literal > 1 ? "dias" : "dia"}`;
            } else if (diferenca < umAno) {
                const literal = Math.floor(diferenca / umMes);
                tempoRelativo = `${literal} ${literal > 1 ? "meses" : "mês"}`;
            } else {
                const literal = Math.floor(diferenca / umAno);
                tempoRelativo = `${literal} ${literal > 1 ? "anos" : "ano"}`;
            }

            return { ...a, tempoFormatado: tempoRelativo };
        });
    }, [atividadesRecentes]);

    if (!atividadesRecentes || !Array.isArray(atividadesRecentes)) return null;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="font-bold">Atividades Recentes</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex flex-col">
                    {atividadesFormatadas.length > 0 ? atividadesFormatadas.map((a, index) => (
                        <div key={a.id || `activity-${index}`}
                             className="flex items-start gap-3 py-3 border-b border-border last:border-0 first:pt-0 last:pb-0">
                            <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">{a.apenadoName}</p>
                                <p className="text-sm text-muted-foreground">Comprovante: {a.verificationCode}</p>
                                <p className="text-xs text-muted-foreground">
                                    Há {a.tempoFormatado}
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