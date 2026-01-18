import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSourceRelevance } from "@/hooks/useAnalytics"
import { useCrawl } from "@/hooks/useCrawl"
import { Play } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useChartCommentary } from "@/hooks/useAnalytics"
import { Lightbulb } from "lucide-react"

export function SourceRelevanceWidget({ projectId }: { projectId: string }) {
    const { data: sources, isLoading } = useSourceRelevance(projectId)
    const { fullScrape } = useCrawl()
    const { toast } = useToast()
    const { data: commentary } = useChartCommentary(projectId, 'sources', sources)

    const handleScrape = async (sourceId: string) => {
        try {
            await fullScrape.mutateAsync({ projectId, sourceIds: [sourceId] })
            toast({ title: "Scrape started", description: "Source added to scrape queue." })
        } catch (e) {
            toast({ title: "Error", description: "Failed to start scrape.", variant: "destructive" })
        }
    }

    if (isLoading) return <div className="h-[300px] flex items-center justify-center">Loading relevance data...</div>

    return (
        <Card className="col-span-full">
            <CardHeader>
                <CardTitle>Source Relevance Ranking</CardTitle>
                <CardDescription>Sources ranked by keyword matches and content quality.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>Relevance Score</TableHead>
                            <TableHead>Top Keywords</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sources?.map((source: any) => (
                            <TableRow key={source.id}>
                                <TableCell className="font-medium">#{source.rank}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{source.name}</span>
                                        <span className="text-xs text-muted-foreground">{source.url}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="w-[30%]">
                                    <div className="flex items-center gap-2">
                                        <Progress value={source.relevance_score * 100} className="h-2" />
                                        <span className="text-xs w-[40px]">{(source.relevance_score * 100).toFixed(0)}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {Object.entries(source.keywords_matched || {}).slice(0, 3).map(([kw, count]: any) => (
                                            <Badge key={kw} variant="secondary" className="text-[10px]">
                                                {kw} ({count})
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button size="sm" variant="ghost" onClick={() => handleScrape(source.id)}>
                                        <Play className="h-3 w-3 mr-1" /> Scrape
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {commentary && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-500 animate-in slide-in-from-bottom-2">
                        <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-green-900 mb-1">Analyse IA</h4>
                                <p className="text-sm text-green-800 leading-relaxed">{commentary}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
