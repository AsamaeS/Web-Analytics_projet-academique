import { useCrawlStatus } from "@/hooks/useCrawl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, Terminal, FileText, AlertCircle } from "lucide-react"

export function CrawlMonitor({ projectId }: { projectId: string }) {
    const { data, isLoading } = useCrawlStatus(projectId)

    if (isLoading || !data || data.active_jobs_count === 0) return null

    return (
        <Card className="mt-6 border-blue-200 bg-blue-50/20">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                    Active Background Jobs ({data.active_jobs_count})
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.jobs.map((job: any) => (
                    <div key={job.id} className="space-y-4 border rounded-lg p-4 bg-background">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2">
                                    {job.type === 'discovery' ? 'Discovery Crawl' : 'Full Scrape'}
                                    <Badge variant="outline">{job.status}</Badge>
                                </h4>
                                <p className="text-sm text-muted-foreground">ID: {job.id}</p>
                            </div>
                            <div className="text-right text-sm">
                                <span className="block font-medium">{job.stats?.pages_scraped || 0} Pages Scraped</span>
                                <span className="text-muted-foreground">{job.stats?.errors?.length || 0} Errors</span>
                            </div>
                        </div>

                        {/* Logs Console */}
                        <div className="rounded-md bg-black/90 p-4 font-mono text-xs text-green-400 h-[150px] overflow-hidden flex flex-col">
                            <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-2 text-white/70">
                                <Terminal className="h-3 w-3" /> Live Logs
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="space-y-1">
                                    {job.stats?.recent_logs?.map((log: string, i: number) => (
                                        <div key={i}>{log}</div>
                                    )) || <span className="text-gray-500">Waiting for logs...</span>}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Recent Items */}
                        {job.stats?.last_scraped_items?.length > 0 && (
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4" /> Recently Parsed Items
                                </h5>
                                <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                                    {job.stats.last_scraped_items.map((item: any, i: number) => (
                                        <div key={i} className="text-xs border p-2 rounded bg-muted/50">
                                            <div className="font-medium truncate" title={item.title}>{item.title || "No Title"}</div>
                                            <div className="text-muted-foreground truncate">{item.url}</div>
                                            <div className="mt-1 flex gap-1 flex-wrap">
                                                {item.matches?.slice(0, 3).map((kw: string) => (
                                                    <span key={kw} className="bg-blue-100 text-blue-700 px-1 rounded text-[10px]">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
