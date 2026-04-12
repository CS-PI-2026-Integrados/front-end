import {Card, CardHeader, CardTitle, CardContent, CardDescription} from "@/components/ui/card.jsx";
import mockPresenca from "@/json/mock/dashboard/mockPresenca.json";

// const listActivities = mockPresenca.

export function RecentActivities() {


    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-bold">Atividades Recentes</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">Últimas ações no sistema</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">

                </div>
            </CardContent>
        </Card>
    );
}