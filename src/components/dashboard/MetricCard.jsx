import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export function MetricCard({ title, value, description, icon }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-light">{title}</CardTitle>
                <span >{icon}</span>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
            <CardFooter>
                <div className="text-sm font-medium">
                    <span>{description}</span>
                </div>
            </CardFooter>
        </Card>
    );
}