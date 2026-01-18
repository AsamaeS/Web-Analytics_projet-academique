import { useRef, useEffect, useState } from 'react'
import { useChat } from '@/hooks/useChat'
import MessageBubble from './MessageBubble'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2, Bot } from 'lucide-react'

export default function ChatInterface({ projectId }: { projectId: string }) {
    const { messages, sendMessage, isLoading } = useChat(projectId)
    const [input, setInput] = useState('')
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const handleSend = () => {
        if (!input.trim() || isLoading) return
        sendMessage(input)
        setInput('')
    }

    return (
        <div className="flex flex-col h-[600px] border rounded-md bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <Bot className="h-12 w-12 mb-4" />
                        <p>Ask questions about your scraped data.</p>
                    </div>
                ) : (
                    messages.map(m => (
                        <MessageBubble key={m.id} message={m} />
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                    <Input
                        placeholder="Ask a question..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
