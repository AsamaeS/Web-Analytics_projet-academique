import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2, User2, MapPin, Tag } from "lucide-react"

export function EntitySummaryWidget({ projectId }: { projectId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['analytics', 'entities', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/entities`)
            return data
        },
        enabled: !!projectId
    })

    if (isLoading) return (
        <Card className="h-full">
            <CardHeader><CardTitle>Entities</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    )

    const categories = [
        { key: 'ORG', label: 'Organizations', icon: Building2 },
        { key: 'PERSON', label: 'People', icon: User2 },
        { key: 'GPE', label: 'Locations', icon: MapPin },
        { key: 'OTHER', label: 'Misc', icon: Tag },
    ]

    const hasData = data && categories.some(cat => data[cat.key]?.length > 0)

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Discovered Entities</CardTitle>
                <CardDescription>Key organizations and people mentioned in data.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <div className="grid grid-cols-2 gap-4">
                        {categories.map(cat => (
                            <div key={cat.key} className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    <cat.icon className="h-3 w-3" />
                                    {cat.label}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {(data[cat.key] || []).length > 0 ? (
                                        data[cat.key].slice(0, 5).map((item: any, i: number) => (
                                            <Badge key={i} variant="outline" className="text-[10px] font-normal">
                                                {item.text} <span className="ml-1 text-muted-foreground opacity-70">({item.count})</span>
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-[10px] text-muted-foreground italic">None</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                        No entities extracted.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
