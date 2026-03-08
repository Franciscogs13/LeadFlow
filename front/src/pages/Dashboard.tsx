import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { LeadTable } from '../components/LeadTable';
import { CreateLeadModal } from '../components/CreateLeadModal';
import { LeadFilters } from '../components/LeadFilters';
import { AIAssistant } from '../components/AIAssistant';
import { Sparkles, Target, Plus, User, LogOut } from 'lucide-react';
import type { Lead, LeadStatus, LeadFilters as ILeadFilters } from '../types';
import * as api from '../api/leads';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard(): JSX.Element {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalLeads, setTotalLeads] = useState<number>(0);
    const [filters, setFilters] = useState<ILeadFilters>({});

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const fetchLeads = async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.getLeads(page, limit, filters);
            setLeads(response.data);
            setTotalPages(response.totalPages);
            setTotalLeads(response.total);
        } catch (err) {
            setError('Erro ao carregar leads. Verifique a conexão com a API.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [page, filters]);

    const handleFilterChange = (newFilters: ILeadFilters): void => {
        setFilters(newFilters);
        setPage(1);
    };

    const handleCreateLead = async (data: Omit<Lead, 'id'>): Promise<void> => {
        try {
            setIsLoading(true);
            await api.createLead(data);
            setPage(1);
            await fetchLeads();
            setIsModalOpen(false);
            toast.success('Lead criado com sucesso!');
        } catch (err) {
            toast.error('Erro ao criar lead.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadLeads = async (file: File): Promise<void> => {
        try {
            setIsLoading(true);
            await api.uploadLeads(file);
            setPage(1);
            await fetchLeads();
            setIsModalOpen(false);
            toast.success('Upload realizado com sucesso! Atualizando sua lista de leads.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Erro ao processar arquivo. Verifique se o formato está correto e as colunas obrigatórias estão presentes.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (id: number, status: LeadStatus): Promise<void> => {
        try {
            await api.updateLeadStatus(id, status);
            setLeads(leads.map(lead => lead.id === id ? { ...lead, status } : lead));
            toast.success('Status atualizado!');
        } catch (err) {
            toast.error('Erro ao atualizar status.');
            console.error(err);
            fetchLeads();
        }
    };

    const handleDelete = async (id: number): Promise<void> => {
        try {
            await api.deleteLead(id);
            await fetchLeads();
            toast.success('Lead removido com sucesso!');
        } catch (err) {
            toast.error('Erro ao deletar lead.');
            console.error(err);
            fetchLeads();
        }
    };

    const handleLogout = (): void => {
        signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex font-sans antialiased">
            <div className="w-full">

                {/* Header customizado no mesmo estilo */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo e nome do usuário */}
                            <div className="flex items-center gap-8">
                                <Link to="/dashboard" className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                                        <Target className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-lg font-semibold text-slate-800">
                                        Lead<span className="text-blue-600">Flow</span>
                                    </span>
                                </Link>

                                {/* Boas-vindas (visível apenas em desktop) */}
                                <div className="hidden md:block">
                                    <span className="text-sm text-slate-500">
                                        Olá, <span className="font-medium text-slate-800">{user?.nome || 'Usuário'}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Ações do usuário */}
                            <div className="flex items-center gap-2">
                                {/* Botão Novo Lead */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Novo Lead</span>
                                </button>

                                {/* Menu do usuário */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-300">
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                            <span className="text-xs font-semibold text-white">
                                                {user?.nome?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <span className="hidden lg:inline text-sm text-slate-700">
                                            {user?.nome?.split(' ')[0] || 'Usuário'}
                                        </span>
                                    </button>

                                    {/* Dropdown menu */}
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <User className="h-4 w-4 text-slate-400" />
                                            Meu Perfil
                                        </Link>

                                        {/* Link para Admin - APARECE APENAS PARA ADMIN */}
                                        {user?.role?.toLowerCase() === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors border-t border-slate-100 mt-1 pt-2"
                                            >
                                                <Target className="h-4 w-4" />
                                                <span className="font-medium">Painel Admin</span>
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Resto do conteúdo permanece igual */}
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header da página */}
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">
                                Dashboard
                            </h1>
                            <p className="text-sm text-slate-500">
                                Gerencie seus leads e acompanhe o funil de vendas
                            </p>
                        </div>

                        {/* Stats rápidos */}
                        <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-200/60 shadow-sm">
                            <div className="text-center">
                                <span className="text-xs text-slate-500">Total</span>
                                <p className="text-xl font-semibold text-slate-800">{totalLeads}</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="text-center">
                                <span className="text-xs text-slate-500">Página</span>
                                <p className="text-xl font-semibold text-slate-800">{page}/{totalPages}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="mb-6">
                        <LeadFilters filters={filters} onFilterChange={handleFilterChange} />
                    </div>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Tabela de leads */}
                    {isLoading && leads.length === 0 ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="flex flex-col items-center gap-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
                                <p className="text-sm text-slate-500">Carregando leads...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 overflow-hidden">
                            <LeadTable
                                leads={leads}
                                onStatusChange={handleStatusChange}
                                onDelete={handleDelete}
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    )}

                    {/* Dicas rápidas */}
                    {leads.length === 0 && !isLoading && !error && (
                        <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-center">
                            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <Target className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                Comece a gerenciar seus leads
                            </h3>
                            <p className="text-sm text-slate-600 mb-4 max-w-md mx-auto">
                                Adicione seu primeiro lead manualmente ou faça upload de uma planilha CSV/Excel.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300"
                            >
                                <Plus className="h-4 w-4" />
                                Adicionar lead
                            </button>
                        </div>
                    )}
                </main>

                {/* Modal de criação */}
                <CreateLeadModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreateLead}
                    onSubmitUpload={handleUploadLeads}
                    isLoading={isLoading}
                />

                {/* Botão Flutuante IA */}
                <button
                    onClick={() => setIsAIOpen(!isAIOpen)}
                    className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-40 flex items-center justify-center group"
                >
                    <Sparkles className="h-6 w-6" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out ml-0 group-hover:ml-2 font-medium">
                        LIA Assistant
                    </span>
                </button>

                {/* Drawer da IA */}
                <AIAssistant
                    isOpen={isAIOpen}
                    onClose={() => setIsAIOpen(false)}
                    filters={filters}
                />
            </div>
        </div>
    );
}

export default Dashboard;