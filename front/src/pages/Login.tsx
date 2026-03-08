import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';
import { 
  Users, 
  Mail, 
  ArrowRight, 
  Target,
  BarChart3,
  Upload,
  Database,
  UserPlus,
  LogIn
} from 'lucide-react';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'consultor';
  };
}

interface ErrorResponse {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

type FocusField = 'email' | 'password' | null;

export function Login(): JSX.Element {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<FocusField>(null);
    const [rememberMe, setRememberMe] = useState<boolean>(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            const response: LoginResponse = await authApi.login(email, password);
            
            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            signIn(response);
            
            // Redirecionar baseado no papel do usuário
            if (response.user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            setError(
                error.response?.data?.detail || 
                'Credenciais inválidas. Verifique seu email e senha.'
            );
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

    const features = [
        { 
            icon: Upload, 
            text: 'Importação em massa', 
            description: 'CSV e Excel',
            color: 'emerald'
        },
        { 
            icon: Target, 
            text: 'Funil de vendas', 
            description: 'Novo · Em contato · Convertido',
            color: 'blue'
        },
        { 
            icon: BarChart3, 
            text: 'Relatórios dinâmicos', 
            description: 'Filtros e exportação',
            color: 'violet'
        },
        { 
            icon: Database, 
            text: 'Gestão completa', 
            description: 'CRUD de leads',
            color: 'amber'
        },
    ];

    const stats = [
        { value: '10k+', label: 'Leads gerenciados', icon: Users },
        { value: '500+', label: 'Equipes ativas', icon: UserPlus },
        { value: '99.9%', label: 'Uptime', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex relative overflow-hidden font-sans antialiased">
            {/* Grid de fundo sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            
            {/* Elementos decorativos minimalistas */}
            <div className="absolute left-0 top-0 w-1/3 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-br-full blur-3xl opacity-40"></div>
            <div className="absolute right-0 bottom-0 w-1/3 h-96 bg-gradient-to-tl from-emerald-50 to-blue-50 rounded-tl-full blur-3xl opacity-40"></div>

            {/* Container principal */}
            <div className="relative w-full max-w-7xl mx-auto flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full lg:w-11/12 xl:w-10/12 grid lg:grid-cols-2 gap-8 items-center">
                    
                    {/* Lado esquerdo - Apresentação do Produto */}
                    <div className="hidden lg:block space-y-8">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-200">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-slate-800">
                                Lead<span className="text-blue-600">Flow</span>
                            </span>
                        </div>

                        {/* Conteúdo principal */}
                        <div className="space-y-6">
                            <div>
                                <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-200/60 shadow-sm">
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-700">
                                        Gestão de Leads · CRM Simplificado
                                    </span>
                                </div>
                            </div>

                            <h1 className="text-4xl font-bold text-slate-800 leading-tight">
                                Organize e acompanhe
                                <span className="block text-transparent bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text">
                                    seu funil de vendas
                                </span>
                            </h1>
                            
                            <p className="text-base text-slate-600 leading-relaxed max-w-md">
                                Plataforma completa para equipes comerciais gerenciarem leads, 
                                importarem contatos em massa e acompanharem conversões em tempo real.
                            </p>

                            {/* Features Grid */}
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div 
                                            key={index} 
                                            className="flex items-start gap-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-slate-200/60 hover:bg-white/80 transition-all duration-300 group cursor-default"
                                        >
                                            <div className={`h-8 w-8 rounded-lg bg-${feature.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                <Icon className={`h-4 w-4 text-${feature.color}-600`} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-slate-800 block">
                                                    {feature.text}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {feature.description}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Estatísticas */}
                            <div className="flex items-center gap-8 pt-4">
                                
                            </div>
                        </div>

                        
                    </div>

                    {/* Lado direito - Formulário de Login */}
                    <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
                        {/* Logo mobile */}
                        <div className="lg:hidden mb-8 flex flex-col items-center">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center shadow-lg mb-3">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-lg font-semibold text-slate-800">
                                Lead<span className="text-blue-600">Flow</span>
                            </span>
                        </div>

                        {/* Card de login */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8 border border-slate-200">
                            {/* Cabeçalho */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                    Acessar plataforma
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Faça login para gerenciar seus leads
                                </p>
                            </div>

                            {/* Formulário */}
                            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                                {/* Mensagem de erro */}
                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                        <p className="text-sm text-red-600 flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                                            {error}
                                        </p>
                                    </div>
                                )}

                                {/* Campo de email */}
                                <div className="space-y-1.5">
                                    <label 
                                        htmlFor="email" 
                                        className="block text-xs font-medium text-slate-600 uppercase tracking-wider"
                                    >
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                            isFocused === 'email' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                            onFocus={() => handleFocus('email')}
                                            onBlur={handleBlur}
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                            placeholder="seu@email.com"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Campo de senha */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label 
                                            htmlFor="password" 
                                            className="block text-xs font-medium text-slate-600 uppercase tracking-wider"
                                        >
                                            Senha
                                        </label>
                                        <Link 
                                            to="/forgot-password" 
                                            className="text-xs text-blue-600 hover:text-blue-500 transition-colors"
                                        >
                                            Esqueceu?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <LogIn className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                            isFocused === 'password' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                            onFocus={() => handleFocus('password')}
                                            onBlur={handleBlur}
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                                            placeholder="••••••••"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Lembrar-me */}
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={rememberMe}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                                            disabled={isLoading}
                                        />
                                        <span className="text-xs text-slate-600">
                                            Manter conectado
                                        </span>
                                    </label>
                                </div>

                                {/* Botão de login */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-medium py-2.5 rounded-lg shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                            <span>Entrando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Entrar</span>
                                            <ArrowRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>

                                {/* Divisor */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 bg-white text-slate-400">
                                            ou
                                        </span>
                                    </div>
                                </div>

                                {/* Link para registro */}
                                <Link
                                    to="/register"
                                    className="block w-full text-center text-sm text-slate-600 hover:text-blue-600 transition-colors"
                                >
                                    Criar nova conta
                                </Link>
                            </form>
                        </div>

                        {/* Breadcrumb de acesso */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-400">
                                <span className="inline-flex items-center gap-1">
                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                    Acesso para administradores e consultores
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;