import { useState } from 'react'
import { useSources, useAddSource, useDeleteSource } from '@/hooks/useSources'
import { useCrawl } from '@/hooks/useCrawl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Trash2, Globe, Play, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { CrawlMonitor } from './CrawlMonitor'

export default function SourcesManager({ projectId }: { projectId: string }) {
    const { toast } = useToast()
    const { data: sources, isLoading } = useSources(projectId)
    const addSourceOriginal = useAddSource()
    const deleteSource = useDeleteSource()
    const { discovery, fullScrape } = useCrawl()

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newSourceUrl, setNewSourceUrl] = useState('')
    const [newSourceName, setNewSourceName] = useState('')

    const handleAddSource = async () => {
        if (!newSourceUrl) return
        try {
            await addSourceOriginal.mutateAsync({
                projectId,
                url: newSourceUrl,
                name: newSourceName || new URL(newSourceUrl).hostname
            })
            setIsAddOpen(false)
            setNewSourceUrl('')
            setNewSourceName('')
            toast({ title: "Source added", description: "Source added to project." })
        } catch (e: any) {
            let desc = "Failed to add source.";
            if (e.message) desc = e.message;
            if (typeof e === 'object' && e !== null && !e.message) desc = JSON.stringify(e);
            toast({ title: "Error", description: desc, variant: "destructive" })
        }
    }

    const handleDiscovery = async () => {
        try {
            await discovery.mutateAsync(projectId)
            toast({ title: "Discovery started", description: "Crawling sources for relevance..." })
        } catch (e) {
            toast({ title: "Error", description: "Failed to start discovery.", variant: "destructive" })
        }
    }

    const handleFullScrape = async () => {
        // Scrape all eligible sources
        const eligible = sources?.filter(s => s.status === 'active' || s.status === 'pending_discovery').map(s => s._id)
        if (!eligible || eligible.length === 0) {
            toast({ title: "No sources", description: "No active sources to scrape." })
            return
        }

        try {
            await fullScrape.mutateAsync({ projectId, sourceIds: eligible })
            toast({ title: "Scrape started", description: `Scraping ${eligible.length} sources.` })
        } catch (e) {
            toast({ title: "Error", description: "Failed to start scrape.", variant: "destructive" })
        }
    }

    // Group sources by status
    const pendingSources = sources?.filter(s => s.status === 'pending_discovery' || s.metrics?.relevance_score === undefined) || []
    const activeSources = sources?.filter(s => s.status === 'active') || []

    if (isLoading) return <div>Loading sources...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Sources & Data Collection</h2>
                    <p className="text-sm text-muted-foreground">Manage URLs and crawling jobs.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDiscovery} disabled={discovery.isPending}>
                        {discovery.isPending ? "Starting..." : "Run Discovery"}
                    </Button>
                    <Button onClick={handleFullScrape} disabled={fullScrape.isPending}>
                        <Play className="mr-2 h-4 w-4" />
                        {fullScrape.isPending ? "Starting..." : "Scrape All Active"}
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary"><Plus className="mr-2 h-4 w-4" /> Add Source</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Source</DialogTitle>
                                <DialogDescription>Add a website URL to monitor.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>URL</Label>
                                    <Input value={newSourceUrl} onChange={e => setNewSourceUrl(e.target.value)} placeholder="https://example.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Name (Optional)</Label>
                                    <Input value={newSourceName} onChange={e => setNewSourceName(e.target.value)} placeholder="Example News" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddSource} disabled={addSourceOriginal.isPending}>Add Source</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <CrawlMonitor projectId={projectId} />

            <div className="grid gap-4 md:grid-cols-2">
                {/* Active Sources */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Active Sources ({activeSources.length})</CardTitle>
                        <CardDescription>Sources approved for full monitoring.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {activeSources.map(source => (
                                <div key={source._id} className="flex items-center justify-between p-2 border rounded-md">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{source.name}</p>
                                            <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"
                                        onClick={() => deleteSource.mutate({ id: source._id, projectId })}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {activeSources.length === 0 && <p className="text-sm text-muted-foreground">No active sources.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Discovery / Candidates */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Candidates & Pending ({pendingSources.length})</CardTitle>
                        <CardDescription>Sources waiting for discovery or approval.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {pendingSources.map(source => (
                                <div key={source._id} className="flex items-center justify-between p-2 border rounded-md bg-muted/30">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{source.name}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                                                {source.metrics?.discovery_completed && (
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${(source.metrics?.relevance_score || 0) > 0.6 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        Score: {((source.metrics?.relevance_score || 0) * 100).toFixed(0)}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {/* In a fuller version, we'd have an 'Approve' button here to move to Active */}
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteSource.mutate({ id: source._id, projectId })}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {pendingSources.length === 0 && <p className="text-sm text-muted-foreground">No pending sources.</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
