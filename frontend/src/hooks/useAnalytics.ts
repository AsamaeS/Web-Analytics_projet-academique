import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useAnalytics(projectId: string) {
    const overview = useQuery({
        queryKey: ['analytics', 'overview', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/overview`)
            return data
        },
        enabled: !!projectId,
    })

    const timeline = useQuery({
        queryKey: ['analytics', 'timeline', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/timeline`)
            return data
        },
        enabled: !!projectId,
    })

    return { overview, timeline }
}

export function useInsights(projectId: string) {
    return useQuery({
        queryKey: ['analytics', 'insights', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/insights`)
            return data
        },
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes since it's expensive/LLM
    })
}

export function useSourceRelevance(projectId: string) {
    return useQuery({
        queryKey: ['analytics', 'relevance', projectId],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${projectId}/analytics/relevance`)
            return data
        },
        enabled: !!projectId
    })
}

export function useChartCommentary(projectId: string, chartType: string, data: any) {
    return useQuery({
        queryKey: ['analytics', 'commentary', projectId, chartType],
        queryFn: async () => {
            if (!data) return null
            const { data: response } = await api.post(`/projects/${projectId}/analytics/commentary`, {
                chart_type: chartType,
                data: data,
                project_context: {} // Backend will fetch
            })
            return response.commentary
        },
        enabled: !!projectId && !!data && Array.isArray(data) && data.length > 0,
        staleTime: 1000 * 60 * 60, // 1 hour
    })
}
