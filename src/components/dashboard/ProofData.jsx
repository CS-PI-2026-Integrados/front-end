import {Card, CardTitle, CardHeader, CardDescription, CardContent} from "@/components/ui/card.jsx";

export function ProofData() {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-bold">Comprovantes Mensais</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">Total de comprovantes emitidos por mês em 2024</CardDescription>
                </CardHeader>
                <CardContent>
                    TABELA
                </CardContent>
            </Card>
        </>
    );
}

