import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from 'date-fns'

export function ScrapedContentWidget({ projectId }: { projectId: string }) {
    const { data: items, isLoading } = useQuery({
        queryKey: ['analytics', 'recent-content', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/recent-content`)
            return data
        },
        refetchInterval: 5000 // Poll every 5s
    })

    if (isLoading) return <div className="h-[300px] border rounded-lg bg-muted/10 animate-pulse" />

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Recently Scraped Content
                </CardTitle>
                <CardDescription>Real-time feed of processed documents.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Relevance</TableHead>
                            <TableHead className="text-right">Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items?.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium max-w-[300px] truncate" title={item.title}>
                                    {item.title || "Untitled"}
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                                        {new URL(item.url).hostname} <ExternalLink className="h-3 w-3" />
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={(item.features?.relevance_score || 0) > 0.5 ? "default" : "secondary"}>
                                        {((item.features?.relevance_score || 0) * 100).toFixed(0)}%
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                                    {item.crawled_at ? formatDistanceToNow(new Date(item.crawled_at), { addSuffix: true }) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                        {(!items || items.length === 0) && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                    No content scraped yet. Start a "Full Scrape" from the Sources tab.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
