import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";

export function MetricCard({ data, icon, title, description, className }) {
    return (
        <Card className={cn("shadow-sm", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{data}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}