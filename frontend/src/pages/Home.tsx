import { useNavigate } from 'react-router-dom'
import { useProjects, useDeleteProject } from '@/hooks/useProjects'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, ExternalLink, Activity } from 'lucide-react'
import { format } from 'date-fns'

export default function Home() {
    const navigate = useNavigate()
    const { data: projects, isLoading } = useProjects()
    const deleteProject = useDeleteProject()

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center">Loading projects...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage your intelligence projects and sources.</p>
                </div>
                <Button onClick={() => navigate('/projects/new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in fade-in-50">
                        <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
                        <p className="mb-4 text-sm text-muted-foreground">Create your first project to start monitoring sources.</p>
                        <Button onClick={() => navigate('/projects/new')}>Create Project</Button>
                    </div>
                ) : (
                    projects?.map((project) => (
                        <div
                            key={project._id}
                            className="group relative flex flex-col justify-between rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary-foreground text-primary uppercase">
                                        {project.type.replace('_', ' ')}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Delete project?')) deleteProject.mutate(project._id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="cursor-pointer" onClick={() => navigate(`/projects/${project._id}`)}>
                                    <h3 className="font-semibold leading-none tracking-tight text-xl">{project.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.description || "No description"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium text-foreground">{project.stats.active_sources}/{project.stats.total_sources}</p>
                                        <p className="text-muted-foreground">Active Sources</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{project.stats.total_documents}</p>
                                        <p className="text-muted-foreground">Documents</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between border-t pt-4">
                                <p className="text-xs text-muted-foreground">
                                    Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
                                </p>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${project._id}`)}>
                                    Open <ExternalLink className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
