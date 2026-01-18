import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useCrawl() {
    const queryClient = useQueryClient()

    const discovery = useMutation({
        mutationFn: async (projectId: string) => {
            const { data } = await api.post(`/projects/${projectId}/crawl/discovery`)
            return data
        },
        onSuccess: (_, projectId) => {
            // Invalidate project stats and sources status
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
            queryClient.invalidateQueries({ queryKey: ['sources', projectId] })
        },
    })

    const fullScrape = useMutation({
        mutationFn: async ({ projectId, sourceIds }: { projectId: string, sourceIds: string[] }) => {
            const { data } = await api.post(`/projects/${projectId}/crawl/full`, sourceIds)
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] })
            queryClient.invalidateQueries({ queryKey: ['sources', variables.projectId] })
        },
    })

    const crawlStatus = useQuery({
        queryKey: ['crawl', 'status'], // Scope to project later if needed, but hook doesn't have projectID in closure. 
        // Wait, useCrawl is a hook factory? No, it's a hook. I need projectId.
        // The original design had useCrawl() without args. I should fix this or pass projectId to the query.
        enabled: false // Disable by default, we'll implement a separate hook or pass args.
    })

    return { discovery, fullScrape }
}

export function useCrawlStatus(projectId: string) {
    return useQuery({
        queryKey: ['crawl', 'status', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/crawl/status`)
            return data
        },
        refetchInterval: 2000, // Poll every 2s
        enabled: !!projectId
    })
}
