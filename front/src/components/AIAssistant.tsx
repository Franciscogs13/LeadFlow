import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, X, Loader2, Sparkles, BarChart3, PieChart as PieChartIcon, LineChart } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
    BarChart, Bar, PieChart, Pie, LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import type { AIChatMessage, LeadFilters, AIChartConfig } from '../types';
import * as aiApi from '../api/ai';

interface AIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    filters: LeadFilters;
}

const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#eab308', '#9333ea', '#db2777', '#0891b2', '#7c3aed'];

function ChartRenderer({ config }: { config: AIChartConfig }) {
    const { type, data, xAxisKey, series } = config;

    const getChartIcon = () => {
        switch (type) {
            case 'bar': return <BarChart3 className="h-3 w-3" />;
            case 'pie': return <PieChartIcon className="h-3 w-3" />;
            case 'line': return <LineChart className="h-3 w-3" />;
            default: return null;
        }
    };

    const renderChart = () => {
        switch (type) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey={xAxisKey || 'name'} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px'
                                }}
                                cursor={{ fill: '#f1f5f9' }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                            {series.map((s, index) => (
                                <Bar
                                    key={s.dataKey}
                                    dataKey={s.dataKey}
                                    name={s.name || s.dataKey}
                                    fill={s.color || COLORS[index % COLORS.length]}
                                    radius={[4, 4, 0, 0]}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                            {series.map((s, idx) => (
                                <Pie
                                    key={s.dataKey}
                                    data={data}
                                    dataKey={s.dataKey}
                                    nameKey={xAxisKey || 'name'}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill={COLORS[idx % COLORS.length]}
                                    label={({ name, percent = 0 }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                                >
                                    {data.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            ))}
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <ReLineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey={xAxisKey || 'name'} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    fontSize: '12px'
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', color: '#334155' }} />
                            {series.map((s, index) => (
                                <Line
                                    key={s.dataKey}
                                    type="monotone"
                                    dataKey={s.dataKey}
                                    name={s.name || s.dataKey}
                                    stroke={s.color || COLORS[index % COLORS.length]}
                                    strokeWidth={2}
                                    activeDot={{ r: 6, fill: s.color || COLORS[index % COLORS.length] }}
                                />
                            ))}
                        </ReLineChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        Tipo de gráfico não suportado: {type}
                    </div>
                );
        }
    };

    return (
        <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 rounded bg-blue-100 flex items-center justify-center">
                    {getChartIcon()}
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Visualização
                </span>
            </div>
            <div className="h-64 w-full bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
                {renderChart()}
            </div>
        </div>
    );
}

export function AIAssistant({ isOpen, onClose, filters }: AIAssistantProps) {
    const [messages, setMessages] = useState<AIChatMessage[]>([{
        role: 'assistant',
        content: 'Olá! Sou o **LIA - Lead Intelligence Assistant** 🤖\n\nPosso ajudar a analisar seus leads com gráficos e tabelas. Experimente perguntar:\n\n' +
            '• "Quantos leads novos entraram hoje?"\n' +
            '• "Mostre os leads convertidos em uma tabela"\n' +
            '• "Crie um gráfico de pizza com os status dos leads"\n' +
            '• "Qual a origem que mais converte?"'
    }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            setIsLoading(true);
            const aiResponse = await aiApi.askAI(userMsg, filters);
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error asking AI:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ **Desculpe, tive um problema ao processar sua pergunta.**\n\nVerifique sua conexão com o servidor e tente novamente.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay para mobile */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            ></div>

            {/* Drawer */}
            <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-white shadow-2xl flex flex-col border-l border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-sm">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">LIA Assistant</h2>
                                <p className="text-xs text-blue-100">Lead Intelligence Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                                : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                                }`}>
                                {msg.role === 'user'
                                    ? <User className="h-4 w-4 text-white" />
                                    : <Bot className="h-4 w-4 text-white" />
                                }
                            </div>

                            {/* Message bubble */}
                            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-md'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                                }`}>
                                {/* Markdown content */}
                                <div className={`prose prose-sm max-w-none ${msg.role === 'user'
                                    ? 'prose-invert'
                                    : 'prose-slate'
                                    }`}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                    </ReactMarkdown>
                                </div>

                                {/* Chart */}
                                {msg.chart && msg.role === 'assistant' && (
                                    <ChartRenderer config={msg.chart} />
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    <span>Analisando dados...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Digite sua pergunta..."
                            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-70"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </form>

                    {/* Sugestões rápidas */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                        <span>Tente: "gráfico de status" ou "leads convertidos"</span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AIAssistant;