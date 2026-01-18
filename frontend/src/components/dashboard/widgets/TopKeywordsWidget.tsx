import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../../lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, Lightbulb } from "lucide-react"
import { useChartCommentary } from "@/hooks/useAnalytics"

export function TopKeywordsWidget({ projectId }: { projectId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['analytics', 'keywords', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/keywords`)
            return data
        },
        enabled: !!projectId
    })

    const { data: commentary } = useChartCommentary(projectId, 'keywords', data)

    if (isLoading) return (
        <Card className="h-full">
            <CardHeader><CardTitle>Keywords</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    )

    const chartData = (data || []).slice(0, 10)
    const hasData = chartData.length > 0

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Top Keywords</CardTitle>
                <CardDescription>Most frequently detected phrases in project content.</CardDescription>
            </CardHeader>
            <CardContent>
                {hasData ? (
                    <>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted))" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="keyword"
                                    type="category"
                                    width={100}
                                    axisLine={false}
                                    tickLine={false}
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="hsl(var(--primary))"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>

                        {commentary && (
                            <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500 animate-in slide-in-from-bottom-2">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-purple-900 mb-1">Analyse IA</h4>
                                        <p className="text-sm text-purple-800 leading-relaxed">{commentary}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                        No keywords detected yet.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
