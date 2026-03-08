import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';
import { User, Mail, Lock, Shield, Save, ArrowLeft, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpdateProfileResponse {
    id: number;
    email: string;
    nome: string;
    role: 'Admin' | 'Consultor';
}

interface ErrorResponse {
    response?: {
        data?: {
            detail?: string;
        };
    };
}

type FocusField = 'nome' | 'email' | 'password' | null;

export function Profile() {
    const { user, updateUser } = useAuth();
    const [nome, setNome] = useState<string>(user?.nome || '');
    const [email, setEmail] = useState<string>(user?.email || '');
    const [password, setPassword] = useState<string>('');

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isFocused, setIsFocused] = useState<FocusField>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setMessage(null);

        if (!user) return;

        try {
            setIsLoading(true);

            const updatedUser: UpdateProfileResponse = await authApi.updateProfile(
                user.id,
                nome,
                email,
                password || undefined
            );

            updateUser(updatedUser as any);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            setPassword('');
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Erro ao atualizar perfil.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFocus = (field: FocusField): void => {
        setIsFocused(field);
    };

    const handleBlur = (): void => {
        setIsFocused(null);
    };

    // Determinar o rótulo correto baseado no role do usuário
    const userRoleLabel = user?.role?.toLowerCase() === 'admin' ? 'Administrador' : 'Consultor';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex font-sans antialiased">
            {/* Container principal */}
            <div className="w-full">

                {/* Header customizado no mesmo estilo */}
                <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                                    <Target className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-semibold text-slate-800">
                                    Lead<span className="text-blue-600">Flow</span>
                                </span>
                            </Link>

                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm">
                                <Link to="/dashboard" className="text-slate-500 hover:text-slate-700 transition-colors">
                                    Dashboard
                                </Link>
                                <span className="text-slate-300">/</span>
                                <span className="text-slate-800 font-medium">Meu Perfil</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Conteúdo principal */}
                <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header da página */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            Meu Perfil
                        </h1>
                        <p className="text-sm text-slate-500">
                            Gerencie suas informações pessoais e preferências de conta
                        </p>
                    </div>

                    {/* Card de perfil */}
                    <div className="bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 overflow-hidden">
                        {/* Cabeçalho do card */}
                        <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
                                    <span className="text-xl font-semibold text-white">
                                        {user?.nome?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800">{user?.nome}</h2>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                                        <Shield className="h-3.5 w-3.5" />
                                        {userRoleLabel}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulário */}
                        <div className="px-6 py-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Mensagem de feedback */}
                                {message && (
                                    <div className={`p-4 rounded-lg border ${message.type === 'success'
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                        : 'bg-red-50 border-red-200 text-red-600'
                                        }`}>
                                        <p className="text-sm flex items-center gap-2">
                                            <span className={`h-1.5 w-1.5 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                                                }`}></span>
                                            {message.text}
                                        </p>
                                    </div>
                                )}

                                {/* Grid de 2 colunas para os campos */}
                                <div className="space-y-5">
                                    {/* Campo Nome */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Nome completo
                                        </label>
                                        <div className="relative">
                                            <User className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused === 'nome' ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <input
                                                type="text"
                                                value={nome}
                                                onChange={(e) => setNome(e.target.value)}
                                                onFocus={() => handleFocus('nome')}
                                                onBlur={handleBlur}
                                                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${isFocused === 'nome'
                                                    ? 'border-blue-600 ring-2 ring-blue-100'
                                                    : 'border-slate-200'
                                                    }`}
                                                placeholder="Seu nome completo"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Campo Email */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused === 'email' ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => handleFocus('email')}
                                                onBlur={handleBlur}
                                                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${isFocused === 'email'
                                                    ? 'border-blue-600 ring-2 ring-blue-100'
                                                    : 'border-slate-200'
                                                    }`}
                                                placeholder="seu@email.com"
                                                required
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>

                                    {/* Campo Nova Senha */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Nova senha
                                        </label>
                                        <div className="relative">
                                            <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isFocused === 'password' ? 'text-blue-600' : 'text-slate-400'
                                                }`} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => handleFocus('password')}
                                                onBlur={handleBlur}
                                                className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${isFocused === 'password'
                                                    ? 'border-blue-600 ring-2 ring-blue-100'
                                                    : 'border-slate-200'
                                                    }`}
                                                placeholder="Deixe em branco para não alterar"
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Mínimo de 6 caracteres se quiser alterar
                                        </p>
                                    </div>

                                    {/* Campo Nível de Acesso (readonly) - AGORA CORRETO */}
                                    <div className="space-y-1">
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Nível de acesso
                                        </label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={userRoleLabel}
                                                disabled
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Botões de ação */}
                                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                                    <Link
                                        to="/dashboard"
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-2"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Voltar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                                <span>Salvando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                <span>Salvar alterações</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Informações adicionais */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            Último acesso: {new Date().toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Profile;