import { Message } from '@/hooks/useChat'
import { cn } from '@/lib/utils'
import { Bot, User } from 'lucide-react'
import Markdown from 'react-markdown'

export default function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === 'user'

    return (
        <div className={cn("flex w-full gap-4 p-4", isUser ? "bg-background" : "bg-muted/30")}>
            <div className={cn(
                "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow",
                isUser ? "bg-background" : "bg-primary text-primary-foreground"
            )}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className="flex-1 space-y-2 overflow-hidden">
                <div className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
                    {isUser ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                        <Markdown>{message.content}</Markdown>
                    )}
                </div>
            </div>
        </div>
    )
}
