import { Trash2, ChevronLeft, ChevronRight, User, Mail, Phone, MapPin, Tag } from 'lucide-react';
import type { Lead, LeadStatus } from '../types';
import { StatusBadge } from './ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

interface LeadTableProps {
    leads: Lead[];
    onStatusChange: (id: number, status: LeadStatus) => void;
    onDelete: (id: number) => void;
    page: number;
    totalPages: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

const statusOptions: LeadStatus[] = ['Novo', 'Em Contato', 'Convertido'];

export function LeadTable({ leads, onStatusChange, onDelete, page, totalPages, limit, onPageChange, onLimitChange }: LeadTableProps) {
    const { user } = useAuth();

    const confirmDelete = (leadId: number, leadName: string): void => {
        Swal.fire({
            title: 'Excluir Lead?',
            text: `Tem certeza que deseja excluir o lead "${leadName}"? Esta ação não pode ser desfeita.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sim, excluir',
            cancelButtonText: 'Cancelar',
            background: '#fff',
            backdrop: 'rgba(0,0,0,0.4)',
            customClass: {
                title: 'text-lg font-semibold text-slate-800',
                htmlContainer: 'text-sm text-slate-600',
                confirmButton: 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors mx-1',
                cancelButton: 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors mx-1'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(leadId);
            }
        });
    };

    if (leads.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-slate-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Nenhum lead encontrado</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Comece adicionando um novo lead clicando no botão "Novo Lead" acima ou ajuste os filtros aplicados.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5" />
                                    Nome / Email
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5" />
                                    Telefone
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Origem
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-3.5 w-3.5" />
                                    Status
                                </div>
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {leads.map((lead, index) => (
                            <tr
                                key={lead.id}
                                className="hover:bg-slate-50/50 transition-colors duration-200 group"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm shadow-blue-200/50 group-hover:scale-105 transition-transform">
                                            <span className="text-sm font-semibold text-white">
                                                {lead.nome?.charAt(0) || 'L'}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-slate-800">{lead.nome}</div>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Mail className="h-3 w-3" />
                                                {lead.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-slate-600">{lead.telefone}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 border border-slate-200">
                                        {lead.origem}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={lead.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        <select
                                            value={lead.status}
                                            onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                                            className="block w-full max-w-[140px] rounded-lg border-0 py-2 pl-3 pr-8 text-sm text-slate-700 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors appearance-none"
                                            style={{
                                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                                                backgroundPosition: 'right 0.5rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.5em 1.5em'
                                            }}
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>

                                        {user?.role === 'Admin' && (
                                            <button
                                                onClick={() => confirmDelete(lead.id, lead.nome)}
                                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                                title="Excluir Lead"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-white px-4 sm:px-6 py-4 gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <p className="text-sm text-slate-500 whitespace-nowrap">
                            Página <span className="font-medium text-slate-700">{page}</span> de <span className="font-medium text-slate-700">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Mostrar:</span>
                            <select
                                value={limit}
                                onChange={(e) => onLimitChange(Number(e.target.value))}
                                className="text-sm border flex-1 border-slate-200 rounded-md text-slate-600 py-1 pl-2 pr-6 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-slate-500 hidden sm:inline">leads por página</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => onPageChange(page - 1)}
                            disabled={page === 1}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Anterior</span>
                        </button>

                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none px-1">
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                let pageNum = page;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (page <= 3) {
                                    pageNum = i + 1;
                                } else if (page >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pageNum
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => onPageChange(page + 1)}
                            disabled={page === totalPages}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
                        >
                            <span className="hidden sm:inline">Próximo</span>
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LeadTable;