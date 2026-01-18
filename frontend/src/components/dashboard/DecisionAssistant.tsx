import React, { useState, useRef, useEffect } from 'react';
import { useChat } from "@/hooks/useChat";
import { Message } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Bot, Sparkles } from "lucide-react";

interface Props {
    projectId: string;
}

export function DecisionAssistant({ projectId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { messages, sendMessage, isLoading } = useChat(projectId);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        await sendMessage(userMsg);
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end`}>
            {/* Chat Window */}
            {isOpen && (
                <Card className="mb-4 w-96 h-[500px] flex flex-col overflow-hidden shadow-2xl border-primary/20 animate-in slide-in-from-bottom-5">
                    <div className="bg-primary p-4 flex justify-between items-center text-primary-foreground shadow-md">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <h3 className="font-semibold">Assistant Décisionnel IA</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-primary-foreground hover:bg-primary-foreground/20"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 p-4 bg-muted/30">
                        <div className="space-y-4" ref={scrollRef}>
                            {messages.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm italic">Posez-moi une question sur vos données pour vous aider dans vos décisions.</p>
                                </div>
                            )}
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground rounded-br-none shadow-sm'
                                        : 'bg-card border border-border text-card-foreground rounded-bl-none shadow-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-card border border-border rounded-2xl p-3 rounded-bl-none shadow-sm flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <form onSubmit={handleSend} className="p-4 bg-card border-t flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Quelle action recommandez-vous ?"
                            className="rounded-full bg-muted/50 focus-visible:ring-primary"
                            disabled={isLoading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full shrink-0"
                            disabled={!input.trim() || isLoading}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </Card>
            )}

            {/* Pulsing Trigger Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-muted text-muted-foreground rotate-90' : 'bg-primary hover:bg-primary/90'
                    }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-foreground border-2 border-primary"></span>
                    </span>
                )}
            </Button>
        </div>
    );
}
