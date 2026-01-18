import { useRef, useState } from 'react'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export function useChat(projectId: string) {
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const queryClient = useQueryClient()

    const sendMessage = async (content: string) => {
        // Add user message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        }
        setMessages(prev => [...prev, userMsg])
        setIsLoading(true)

        try {
            // Create history for context
            const history = messages.map(m => ({ role: m.role, content: m.content }))

            const response = await fetch(`/api/projects/${projectId}/chat/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: content,
                    conversation_history: history
                })
            })

            if (!response.ok) {
                throw new Error(response.statusText)
            }

            if (!response.body) throw new Error("No response body")

            // Stream response
            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let assistantMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistantMsg])

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6))
                            assistantMsg.content += data.content

                            setMessages(prev =>
                                prev.map(m => m.id === assistantMsg.id ? { ...m, content: assistantMsg.content } : m)
                            )
                        } catch (e) {
                            console.error("Error parsing chunk", e)
                            setMessages(prev =>
                                prev.map(m =>
                                    m.id === assistantMsg.id ? { ...m, content: `Error: ${e instanceof Error ? e.message : 'Unknown error'}` } : m
                                )
                            )
                        }
                    }
                }
            }

        } catch (e) {
            console.error(e)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                content: 'Error: Failed to get response. Please ensure the backend is running and Groq API key is valid.',
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return { messages, sendMessage, isLoading }
}
