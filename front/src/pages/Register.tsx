import React, { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';
import { 
  Mail, 
  Lock, 
  User as UserIcon,
  CheckCircle,
  Target
} from 'lucide-react';

interface RegisterResponse {
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

type FocusField = 'nome' | 'email' | 'password' | null;

export function Register(): JSX.Element {
    const [nome, setNome] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const role = 'Consultor';

    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFocused, setIsFocused] = useState<FocusField>(null);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (!nome || !email || !password) {
            setError('Por favor, preencha todos os campos');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            
            const response: RegisterResponse = await authApi.register(nome, email, password, role);
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            signIn(response);
            navigate('/dashboard', { replace: true });
        } catch (err: unknown) {
            const error = err as ErrorResponse;
            setError(
                error.response?.data?.detail || 
                'Erro ao realizar cadastro. Verifique os dados e tente novamente.'
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

    const benefits = [
        'Gestão completa de leads',
        'Relatórios dinâmicos',
        'Importação em massa CSV/Excel',
        'Suporte prioritário',
    ];

    return (
        <div className="min-h-screen bg-white flex font-sans antialiased">
            {/* Container principal */}
            <div className="w-full flex min-h-screen">
                
                {/* Lado Esquerdo - Formulário (50%) */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                    <div className="w-full max-w-md">
                        {/* Logo mobile - visível apenas em mobile */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Target className="h-6 w-6 text-white" />
                            </div>
                        </div>

                        {/* Card de cadastro */}
                        <div className="w-full">
                            {/* Header */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-slate-800 mb-1">
                                    Cria conta
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Preencha os dados para começar
                                </p>
                            </div>

                            {/* Formulário */}
                            <form className="space-y-5" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                        <p className="text-xs text-red-600 text-center">{error}</p>
                                    </div>
                                )}

                                {/* Campo de nome */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Nome completo
                                    </label>
                                    <div className="relative">
                                        <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                            isFocused === 'nome' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                        <input
                                            type="text"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            onFocus={() => handleFocus('nome')}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                                                isFocused === 'nome' 
                                                    ? 'border-blue-600 ring-2 ring-blue-100' 
                                                    : 'border-slate-200'
                                            }`}
                                            placeholder="João Silva"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Campo de email */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                            isFocused === 'email' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => handleFocus('email')}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                                                isFocused === 'email' 
                                                    ? 'border-blue-600 ring-2 ring-blue-100' 
                                                    : 'border-slate-200'
                                            }`}
                                            placeholder="seu@email.com"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                {/* Campo de senha */}
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Senha
                                    </label>
                                    <div className="relative">
                                        <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                                            isFocused === 'password' ? 'text-blue-600' : 'text-slate-400'
                                        }`} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => handleFocus('password')}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                                                isFocused === 'password' 
                                                    ? 'border-blue-600 ring-2 ring-blue-100' 
                                                    : 'border-slate-200'
                                            }`}
                                            placeholder="mínimo 6 caracteres"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Use pelo menos 6 caracteres
                                    </p>
                                </div>

                                {/* Botão de cadastro */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                            <span>Criando conta...</span>
                                        </div>
                                    ) : (
                                        'Criar conta'
                                    )}
                                </button>

                                {/* Já tem conta */}
                                <div className="text-center">
                                    <span className="text-sm text-slate-500">já tem uma conta? </span>
                                    <Link 
                                        to="/login" 
                                        className="text-sm text-blue-600 hover:text-blue-500 transition-colors font-medium"
                                    >
                                        Fazer login
                                    </Link>
                                </div>

                                {/* Termos de uso */}
                                <p className="text-center text-xs text-slate-400 mt-6">
                                    Ao criar sua conta, você concorda com nossos{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-500">Termos</a>
                                    {' '}e{' '}
                                    <a href="#" className="text-blue-600 hover:text-blue-500">Política de Privacidade</a>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Lado Direito - Conteúdo (50%) com o MESMO BACKGROUND DO LOGIN E GRID SUTIL */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-50 via-white to-blue-50 items-center justify-center p-12 relative overflow-hidden">
                    
                    {/* Grid de fundo sutil - IGUAL AO LOGIN */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    
                    <div className="max-w-md relative z-10">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-slate-800">
                                Lead<span className="text-blue-600">Flow</span>
                            </span>
                        </div>

                        {/* Título */}
                        <h1 className="text-3xl font-bold text-slate-800 mb-4">
                            Comece a gerenciar<br />
                            <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                                seus leads hoje mesmo
                            </span>
                        </h1>
                        
                        {/* Subtítulo */}
                        <p className="text-base text-slate-600 leading-relaxed mb-8">
                            Crie sua conta gratuita e tenha acesso a todas as ferramentas 
                            para organizar seu funil de vendas e acompanhar conversões.
                        </p>

                        {/* Lista de benefícios */}
                        <div className="space-y-3 mb-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                                    </div>
                                    <span className="text-sm text-slate-600">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;