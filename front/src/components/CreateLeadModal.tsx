import React, { useEffect, useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Info, User, Mail, Phone, MapPin, Tag, Target } from 'lucide-react';
import type { Lead } from '../types';

interface CreateLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Lead, 'id'>) => Promise<void>;
    onSubmitUpload?: (file: File) => Promise<void>;
    isLoading: boolean;
}

type FocusField = 'nome' | 'email' | 'telefone' | 'origem' | null;

export function CreateLeadModal({ isOpen, onClose, onSubmit, onSubmitUpload, isLoading }: CreateLeadModalProps) {
    const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isFocused, setIsFocused] = useState<FocusField>(null);

    const [formData, setFormData] = useState<Omit<Lead, 'id'>>({
        nome: '',
        email: '',
        telefone: '',
        origem: '',
        status: 'Novo',
    });

    // Reset form when opened
    useEffect(() => {
        if (isOpen) {
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                origem: '',
                status: 'Novo',
            });
            setActiveTab('manual');
            setSelectedFile(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmitManual = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleSubmitUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedFile && onSubmitUpload) {
            await onSubmitUpload(selectedFile);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleFocus = (field: FocusField): void => {
        setIsFocused(field);
    };

    const handleBlur = (): void => {
        setIsFocused(null);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Overlay com blur */}
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal */}
                <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-slate-200">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-5 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                                    <Target className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800" id="modal-title">
                                        Adicionar Novo Lead
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Preencha os dados do lead
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    {onSubmitUpload && (
                        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6">
                            <button
                                onClick={() => setActiveTab('manual')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'manual'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                Preenchimento Manual
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                Upload de Planilha
                            </button>
                        </div>
                    )}

                    {/* Conteúdo */}
                    <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                        {activeTab === 'manual' ? (
                            <form onSubmit={handleSubmitManual} className="space-y-4">
                                {/* Campo Nome */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Nome completo <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused === 'nome' ? 'text-blue-600' : 'text-slate-400'
                                            }`} />
                                        <input
                                            type="text"
                                            name="nome"
                                            value={formData.nome}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('nome')}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${isFocused === 'nome'
                                                ? 'border-blue-600 ring-2 ring-blue-100'
                                                : 'border-slate-200'
                                                }`}
                                            placeholder="João Silva"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Email */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Email <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused === 'email' ? 'text-blue-600' : 'text-slate-400'
                                            }`} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('email')}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${isFocused === 'email'
                                                ? 'border-blue-600 ring-2 ring-blue-100'
                                                : 'border-slate-200'
                                                }`}
                                            placeholder="joao@exemplo.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Telefone */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Telefone <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused === 'telefone' ? 'text-blue-600' : 'text-slate-400'
                                            }`} />
                                        <input
                                            type="tel"
                                            name="telefone"
                                            value={formData.telefone}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('telefone')}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${isFocused === 'telefone'
                                                ? 'border-blue-600 ring-2 ring-blue-100'
                                                : 'border-slate-200'
                                                }`}
                                            placeholder="(11) 99999-9999"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Campo Origem */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Origem
                                    </label>
                                    <div className="relative">
                                        <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused === 'origem' ? 'text-blue-600' : 'text-slate-400'
                                            }`} />
                                        <select
                                            name="origem"
                                            value={formData.origem}
                                            onChange={handleChange}
                                            onFocus={() => handleFocus('origem')}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 pr-8 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none transition-all appearance-none cursor-pointer ${isFocused === 'origem'
                                                ? 'border-blue-600 ring-2 ring-blue-100'
                                                : 'border-slate-200'
                                                }`}
                                            style={{
                                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.25em 1.25em'
                                            }}
                                        >
                                            <option value="" disabled>Selecione a origem</option>
                                            <option value="Google Ads">Google Ads</option>
                                            <option value="Meta Ads">Meta Ads</option>
                                            <option value="TikTok Ads">TikTok Ads</option>
                                            <option value="Bing Ads">Bing Ads</option>
                                            <option value="LinkedIn Ads">LinkedIn Ads</option>
                                            <option value="X Ads">X Ads</option>
                                            <option value="CRM">CRM</option>
                                            <option value="Indicado">Indicado</option>
                                            <option value="Outro">Outro</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Campo Status */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                                            style={{
                                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                                                backgroundPosition: 'right 0.75rem center',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: '1.25em 1.25em'
                                            }}
                                        >
                                            <option value="Novo">Novo</option>
                                            <option value="Em Contato">Em Contato</option>
                                            <option value="Convertido">Convertido</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                <span>Salvando...</span>
                                            </>
                                        ) : (
                                            'Salvar Lead'
                                        )}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmitUpload} className="space-y-4">
                                {/* Instruções */}
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                    <div className="h-6 w-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Info className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        <p className="font-medium text-slate-700 mb-1">Instruções para a planilha:</p>
                                        <p className="text-xs text-slate-500 mb-2">A planilha deve conter preferencialmente as seguintes colunas:</p>
                                        <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                                            <li><span className="font-medium text-slate-600">nome</span> (obrigatório)</li>
                                            <li><span className="font-medium text-slate-600">email</span> (obrigatório)</li>
                                            <li><span className="font-medium text-slate-600">telefone</span> (obrigatório)</li>
                                            <li><span className="font-medium text-slate-600">origem</span> (opcional)</li>
                                            <li><span className="font-medium text-slate-600">status</span> (opcional)</li>
                                        </ul>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const csvContent = "nome,email,telefone,origem,status\nJoão Silva,joao@exemplo.com,11999999999,Google Ads,Novo\nMaria Oliveira,maria@email.com,21988888888,,";
                                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                const link = document.createElement('a');
                                                link.href = URL.createObjectURL(blob);
                                                link.setAttribute('download', 'modelo_leads.csv');
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700 underline decoration-blue-300 hover:decoration-blue-600 transition-all flex items-center gap-1"
                                        >
                                            <FileSpreadsheet className="h-3.5 w-3.5" />
                                            Baixar planilha modelo
                                        </button>
                                    </div>
                                </div>

                                {/* Área de upload */}
                                <div className="mt-4">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                        Arquivo
                                    </label>
                                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${selectedFile
                                        ? 'border-green-300 bg-green-50/30'
                                        : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                                        }`}>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                                            onChange={handleFileChange}
                                        />

                                        {selectedFile ? (
                                            <div className="flex flex-col items-center">
                                                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center mb-2">
                                                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                                                </div>
                                                <p className="text-sm font-medium text-slate-800">{selectedFile.name}</p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                                </p>
                                                <label
                                                    htmlFor="file-upload"
                                                    className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                                                >
                                                    Trocar arquivo
                                                </label>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                                                    <UploadCloud className="h-6 w-6 text-slate-400" />
                                                </div>
                                                <div className="text-sm text-slate-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                                                    >
                                                        Clique para upload
                                                    </label>
                                                    <span className="text-slate-400"> ou arraste para cá</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-2">
                                                    CSV, XLS ou XLSX até 10MB
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Botões */}
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading || !selectedFile}
                                        className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                <span>Enviando...</span>
                                            </>
                                        ) : (
                                            'Fazer Upload'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateLeadModal;