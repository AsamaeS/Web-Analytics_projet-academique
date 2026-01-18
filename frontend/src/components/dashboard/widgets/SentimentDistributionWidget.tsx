import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useQuery } from "@tanstack/react-query"
import { api } from "../../../lib/api"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

import { Loader2, Lightbulb } from "lucide-react"
import { useChartCommentary } from "@/hooks/useAnalytics"

const COLORS = {
    'Positive': '#10b981', // emerald-500
    'Neutral': '#f59e0b', // amber-500
    'Negative': '#ef4444', // red-500
}

export function SentimentDistributionWidget({ projectId }: { projectId: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['analytics', 'sentiment', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/sentiment`)
            return data
        },
        enabled: !!projectId
    })

    const { data: commentary } = useChartCommentary(projectId, 'sentiment', data)

    if (isLoading) return (
        <Card className="h-full">
            <CardHeader><CardTitle>Sentiment</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    )

    const chartData = data || []
    const hasData = chartData.length > 0

    return (
        <Card className="h-full">

            <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
                <CardDescription>Global sentiment across all scraped documents.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-[300px]">
                {hasData ? (
                    <>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="label"
                                >
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[entry.label as keyof typeof COLORS] || '#8884d8'}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>

                        {commentary && (
                            <div className="mt-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500 animate-in slide-in-from-bottom-2">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-semibold text-orange-900 mb-1">Analyse IA</h4>
                                        <p className="text-sm text-orange-800 leading-relaxed">{commentary}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                        No sentiment data available.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
