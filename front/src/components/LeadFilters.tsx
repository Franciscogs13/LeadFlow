import React, { useState } from 'react';
import { Search, Download, Filter, X } from 'lucide-react';
import type { LeadFilters as ILeadFilters, LeadStatus } from '../types';
import * as api from '../api/leads';
import { toast } from 'react-hot-toast';

interface LeadFiltersProps {
    filters: ILeadFilters;
    onFilterChange: (filters: ILeadFilters) => void;
}

const statusOptions: { value: LeadStatus | ''; label: string; color: string }[] = [
    { value: '', label: 'Todos os Status', color: 'slate' },
    { value: 'Novo', label: 'Novo', color: 'blue' },
    { value: 'Em Contato', label: 'Em Contato', color: 'amber' },
    { value: 'Convertido', label: 'Convertido', color: 'emerald' }
];

export function LeadFilters({ filters, onFilterChange }: LeadFiltersProps): JSX.Element {
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false);

    const handleExport = async (): Promise<void> => {
        try {
            setIsExporting(true);
            const data = await api.exportLeads(filters);

            if (!data || data.length === 0) {
                toast.error('Nenhum dado encontrado para exportar.');
                return;
            }

            // Converter JSON para CSV
            const separator = ',';
            const keys = Object.keys(data[0]) as Array<keyof typeof data[0]>;

            const csvContent = [
                keys.join(separator),
                ...data.map(item =>
                    keys.map(k => `"${String(item[k]).replace(/"/g, '""')}"`).join(separator)
                )
            ].join('\n');

            // Criar Blob e URL de download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            // Criar link temporário e forçar clique
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `leads_export_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Exportação concluída com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            toast.error('Falha ao exportar os dados. Tente novamente mais tarde.');
        } finally {
            setIsExporting(false);
        }
    };

    const clearFilters = (): void => {
        onFilterChange({});
        toast.success('Filtros removidos');
    };

    const hasActiveFilters = filters.search || filters.status;

    return (
        <div className="bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 overflow-hidden mb-6">
            {/* Header dos filtros */}
            <div className="px-5 py-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Filter className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Filtros</span>
                    {hasActiveFilters && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                            Ativos
                        </span>
                    )}
                </div>
                
                {/* Botão para limpar filtros (aparece apenas se houver filtros ativos) */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        <X className="h-3.5 w-3.5" />
                        Limpar filtros
                    </button>
                )}
            </div>

            {/* Corpo dos filtros */}
            <div className="p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Campo de busca */}
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className={`h-5 w-5 transition-colors ${
                                filters.search ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'
                            }`} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            value={filters.search || ''}
                            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    {/* Select de status */}
                    <div className="lg:w-72 relative group">
                        <select
                            value={filters.status || ''}
                            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as LeadStatus | '' })}
                            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer hover:bg-slate-100/50"
                            style={{
                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.25em 1.25em'
                            }}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        
                        {/* Indicador de status ativo */}
                        {filters.status && (
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        )}
                    </div>

                    {/* Botão de exportação */}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-200/50 hover:shadow-xl hover:shadow-emerald-300/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px]"
                    >
                        {isExporting ? (
                            <>
                                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                <span>Exportando...</span>
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                <span>Baixar CSV</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Dicas de uso (opcional) */}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                    <span>Digite para buscar • Selecione um status para filtrar</span>
                </div>
            </div>

            {/* Barra de status dos filtros ativos (opcional) */}
            {hasActiveFilters && (
                <div className="px-5 py-2 bg-slate-50/50 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-slate-500">Filtros aplicados:</span>
                    {filters.search && (
                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1">
                            <Search className="h-3 w-3 text-slate-400" />
                            <span className="text-slate-600">"{filters.search}"</span>
                        </span>
                    )}
                    {filters.status && (
                        <span className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-full px-3 py-1">
                            <span className={`h-1.5 w-1.5 rounded-full bg-${
                                filters.status === 'Novo' ? 'blue' : 
                                filters.status === 'Em Contato' ? 'amber' : 'emerald'
                            }-500`}></span>
                            <span className="text-slate-600">{filters.status}</span>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

export default LeadFilters;