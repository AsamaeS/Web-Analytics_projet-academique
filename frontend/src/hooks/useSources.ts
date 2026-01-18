import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Source } from '@/types'

export function useSources(projectId: string) {
    return useQuery({
        queryKey: ['sources', projectId],
        queryFn: async () => {
            const { data } = await api.get<Source[]>(`/projects/${projectId}/sources`)
            return data
        },
        enabled: !!projectId,
    })
}

export function useAddSource() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ projectId, ...source }: { projectId: string, url: string, name: string }) => {
            const { data } = await api.post<Source>(`/projects/${projectId}/sources`, source)
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sources', variables.projectId] })
        },
    })
}

export function useDeleteSource() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async ({ id, projectId }: { id: string, projectId: string }) => {
            await api.delete(`/sources/${id}`)
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['sources', variables.projectId] })
        },
    })
}
