'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessageToAI, ChatMessage } from '@/app/actions/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BrixAureAIProps {
    lang: string;
    dict: {
        welcome_title: string;
        welcome_subtitle: string;
        placeholder: string;
        error_generic: string;
    };
    projectId?: string;
}

export default function BrixAureAI({ lang, dict, projectId }: BrixAureAIProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: inputValue };

        // Optimistic update
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            // Call Server Action with Lang and ProjectContext
            const response = await sendMessageToAI([...messages, userMessage], lang, projectId);

            if (response.success && response.message) {
                setMessages(prev => [...prev, response.message]);
            } else {
                throw new Error(response.error || "Erro desconhecido");
            }
        } catch (err: any) {
            console.error(err);
            setError(dict?.error_generic || "Connection error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-96 h-[500px] bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 flex justify-between items-center text-white shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="relative w-6 h-6">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <img src="/images/logo/BrixAureAI_Fundo_Quadrado.png" alt="BrixAureAI Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-amber-600 rounded-full animate-pulse" />
                                </div>
                                <h3 className="font-semibold text-sm tracking-wide">BrixAureIA</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white transition-colors"
                                aria-label="Close Chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-amber-200 scrollbar-track-transparent">
                            {messages.length === 0 && !error && (
                                <div className="text-center text-slate-400 mt-10 text-sm flex flex-col items-center">
                                    <div className="w-16 h-16 mb-4 opacity-50 bg-amber-100 rounded-full flex items-center justify-center overflow-hidden">
                                        <img src="/images/logo/BrixAureAI_Fundo_Quadrado.png" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <p dangerouslySetInnerHTML={{ __html: dict?.welcome_title || 'Olá! Sou seu assistente <strong>BrixAureIA</strong>' }} />
                                    <p className="mt-2 text-slate-500">{dict?.welcome_subtitle || 'Analiso dados, tendências e seu portfólio.'}</p>

                                    {projectId && (
                                        <div className="mt-8 w-full space-y-2 px-4">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 text-left mb-2">Sugestões para este projeto:</p>
                                            {[
                                                "Este projeto é viável?",
                                                "Quais os principais riscos?",
                                                "Como melhorar o retorno?",
                                                "Análise do mix de unidades"
                                            ].map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setInputValue(q)}
                                                    className="w-full text-left px-3 py-2 bg-white border border-amber-100 rounded-xl text-xs text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 transition-all shadow-sm flex items-center gap-2 group"
                                                >
                                                    <span className="text-amber-400 group-hover:scale-110 transition-transform">✨</span>
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 text-red-500 text-sm text-center">
                                    {error}
                                </div>
                            )}

                            {messages.map((m, index) => (
                                <div
                                    key={index}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {m.role !== 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-white border border-amber-100 flex items-center justify-center mr-2 shadow-sm shrink-0 overflow-hidden">
                                            <img src="/images/logo/BrixAureAI_Fundo_Quadrado.png" alt="AI" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user'
                                            ? 'bg-amber-500 text-white rounded-br-none'
                                            : 'bg-white text-slate-700 rounded-bl-none border border-slate-100 shadow-md'
                                            }`}
                                    >
                                        <div className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-li:my-1 prose-strong:text-amber-700">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                                    li: ({ children }) => <li className="marker:text-amber-500">{children}</li>,
                                                    strong: ({ children }) => <strong className="font-bold text-slate-900 border-b border-amber-200/50">{children}</strong>
                                                }}
                                            >
                                                {m.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start items-end">
                                    <div className="w-8 h-8 rounded-full bg-white border border-amber-100 flex items-center justify-center mr-2 shadow-sm shrink-0 overflow-hidden">
                                        <img src="/images/logo/BrixAureAI_Fundo_Quadrado.png" alt="AI" className="w-full h-full object-cover animate-pulse" />
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-md flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} className="p-3 bg-white/50 border-t border-slate-100">
                            <div className="relative flex items-center">
                                <input
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all placeholder:text-slate-400"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder={dict?.placeholder || "Ask..."}
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={isLoading || !inputValue.trim()}
                                    className="absolute right-2 p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:hover:bg-amber-500 transition-colors shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                </button>
                            </div>
                        </form>

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.div className="flex flex-col items-end gap-3 pointer-events-none">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white px-3 py-1.5 rounded-xl shadow-lg border border-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-widest whitespace-nowrap mb-1 flex items-center gap-2"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            {projectId ? 'Análise do Projeto Ativa' : 'BrixAureIA Online'}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 pointer-events-auto ${isOpen
                        ? 'bg-slate-800 text-white rotate-90'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                        }`}
                >
                    {isOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    ) : (
                        <div className="relative">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 8V4H8" />
                                <rect width="16" height="12" x="4" y="8" rx="2" />
                                <path d="M2 14h2" />
                                <path d="M20 14h2" />
                                <path d="M15 13v2" />
                                <path d="M9 13v2" />
                            </svg>
                            <span className="absolute -top-1 -right-1 text-xs">✨</span>
                        </div>
                    )}
                </motion.button>
            </motion.div>
        </div>
    );
}

