import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from 'date-fns'
import { useChartCommentary } from '@/hooks/useAnalytics'
import { Lightbulb } from 'lucide-react'

export default function TimelineChart({ data, projectId }: { data: any[], projectId?: string }) {
    const { data: commentary, isLoading: isCommentaryLoading } = useChartCommentary(projectId || '', 'timeline', data)
    if (!data || data.length === 0) return (
        <Card className="col-span-4">
            <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
            </CardContent>
        </Card>
    )

    const chartData = data.map(item => ({
        date: item._id, // Assuming backend groups by date string
        count: item.count
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Content Acquisition Over Time</CardTitle>
                <CardDescription>Daily volume of scraped documents.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(str) => {
                                try {
                                    return format(new Date(str), 'MMM d')
                                } catch (e) {
                                    return str
                                }
                            }}
                            minTickGap={30}
                            tickMargin={8}
                        />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            labelFormatter={(label) => {
                                try {
                                    return format(new Date(label), 'PPP')
                                } catch (e) {
                                    return label
                                }
                            }}
                        />
                        <Area type="monotone" dataKey="count" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>

                {commentary && (
                    <div className="mt-4 mx-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 animate-in slide-in-from-bottom-2">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">Analyse IA</h4>
                                <p className="text-sm text-blue-800 leading-relaxed">{commentary}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
