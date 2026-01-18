import React, { useState, useRef, useEffect } from 'react';
import { chatWithData } from '../../lib/api';

interface Props {
    projectContext: any;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatAssistant({ projectContext }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Bonjour ! Je suis votre assistant IA. Posez-moi une question sur les données du projet pour vous aider à décider.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input;
        setInput('');
        setLoading(true);

        const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
        setMessages(newMessages);

        try {
            const response = await chatWithData(userMsg, newMessages, projectContext);
            setMessages([...newMessages, { role: 'assistant', content: typeof response === 'string' ? response : JSON.stringify(response) }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'assistant', content: "Désolé, une erreur est survenue." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end ${isOpen ? 'w-96' : 'w-auto'}`}>

            {/* Fenêtre de Chat */}
            {isOpen && (
                <div className="bg-white rounded-lg shadow-xl border border-blue-200 mb-4 w-full h-[500px] flex flex-col overflow-hidden animate-fade-in-up">
                    <div className="bg-blue-600 p-4 flex justify-between items-center">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <span>🤖</span> Assistant Décisionnel
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-blue-100 hover:text-white">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-lg p-3 rounded-bl-none shadow-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez votre question..."
                                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Bouton Flottant */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${isOpen ? 'bg-gray-500' : 'bg-blue-600 animate-bounce'} text-white p-4 rounded-full shadow-lg hover:brightness-110 transition-all duration-300 flex items-center justify-center`}
            >
                {isOpen ? '✕' : <span className="text-2xl">💬</span>}
            </button>
        </div>
    );
}
