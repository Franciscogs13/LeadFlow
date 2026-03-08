import { Plus, User as UserIcon, LogOut, Shield, Target } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
    totalLeads: number;
    onAddLead: () => void;
    hideActions?: boolean;
}

export function Header({ totalLeads, onAddLead, hideActions = false }: HeaderProps) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const handleLogout = (): void => {
        signOut();
        navigate('/login');
    };

    return (
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo e informações */}
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200/50 group-hover:scale-105 transition-transform duration-300">
                                <Target className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                                    Lead<span className="text-blue-600">Flow</span>
                                </h1>
                                {!hideActions && (
                                    <p className="text-xs text-slate-500">
                                        Total de leads: <span className="font-semibold text-slate-700">{totalLeads}</span>
                                    </p>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Ações do usuário */}
                    <div className="flex items-center gap-3">
                        {!hideActions && (
                            <button
                                onClick={onAddLead}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/50 transition-all duration-300"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Novo Lead</span>
                                <span className="sm:hidden">Novo</span>
                            </button>
                        )}

                        {/* Menu do usuário */}
                        <div className="relative group" onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget)) setIsUserMenuOpen(false);
                        }}>
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-2.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                            >
                                <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                    <span className="text-sm font-semibold text-white">
                                        {user?.nome?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <span className="hidden lg:inline text-sm font-medium text-slate-700">
                                    {user?.nome?.split(' ')[0] || 'Usuário'}
                                </span>
                            </button>

                            {/* Dropdown menu */}
                            <div className={`absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 transition-all duration-300 z-50 origin-top-right ${isUserMenuOpen ? 'opacity-100 visible scale-100 translate-y-0' : 'opacity-0 invisible scale-95 -translate-y-2'}`}>
                                {/* Link para Perfil */}
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                    <UserIcon className="h-4 w-4 text-slate-400" />
                                    Meu Perfil
                                </Link>

                                {/* Link para Admin - APARECE APENAS PARA ADMIN */}
                                {user?.role?.toLowerCase() === 'admin' && (
                                    <Link
                                        to="/admin"
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 transition-colors border-t border-slate-100 mt-1 pt-2"
                                    >
                                        <Shield className="h-4 w-4" />
                                        <span className="font-medium">Painel Admin</span>
                                    </Link>
                                )}

                                {/* Botão Sair */}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
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
    );
}

export default Header;