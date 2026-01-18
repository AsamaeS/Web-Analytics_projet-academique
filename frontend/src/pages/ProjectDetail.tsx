import { useParams } from 'react-router-dom'
import { useProject } from '@/hooks/useProjects'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SourcesManager from '@/components/sources/SourcesManager'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import ChatInterface from '@/components/chat/ChatInterface'
import { Settings } from 'lucide-react'

export default function ProjectDetail() {
    const { id } = useParams()
    const { data: project, isLoading } = useProject(id || '')

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading project...</div>
    if (!project) return <div className="p-8 text-center text-destructive">Project not found</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <p className="text-muted-foreground">{project.description || project.type}</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div>
                        <span className="font-semibold text-foreground">{project.stats.total_sources}</span> Sources
                    </div>
                    <div>
                        <span className="font-semibold text-foreground">{project.stats.total_documents}</span> Documents
                    </div>
                </div>
            </div>

            <Tabs defaultValue="sources" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="sources">Sources & Crawling</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
                    <TabsTrigger value="chat">AI Assistant</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" /> Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="sources">
                    <SourcesManager projectId={id!} />
                </TabsContent>

                <TabsContent value="analytics">
                    <DashboardGrid projectId={id!} projectType={project.type as any} />
                </TabsContent>

                <TabsContent value="chat">
                    <ChatInterface projectId={id!} />
                </TabsContent>

                <TabsContent value="settings">
                    <div className="p-4 border rounded-md text-muted-foreground">Settings placeholder</div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
