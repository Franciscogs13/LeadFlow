import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as authApi from '../api/auth';
import type { User } from '../types';
import { Shield, Trash2, Users, Target, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

export function Admin(): JSX.Element {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (user?.role?.toLowerCase() !== 'admin') {
            navigate('/');
            return;
        }

        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async (): Promise<void> => {
        try {
            setIsLoading(true);
            const data = await authApi.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Erro ao carregar usuários.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: number): Promise<void> => {
        if (userId === user?.id) {
            toast.error('Você não pode excluir sua própria conta.');
            return;
        }

        const result = await Swal.fire({
            title: 'Excluir Usuário?',
            text: "Tem certeza que deseja remover este usuário permanentemente?",
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
                confirmButton: 'px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors',
                cancelButton: 'px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors'
            }
        });

        if (result.isConfirmed) {
            try {
                await authApi.deleteUser(userId);
                setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
                toast.success('Usuário excluído com sucesso.');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Erro ao deletar usuário.');
            }
        }
    };

    const handleLogout = (): void => {
        signOut();
        navigate('/login');
    };

    if (user?.role?.toLowerCase() !== 'admin') return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex font-sans antialiased">
            <div className="w-full">

                {/* Header no mesmo estilo das outras páginas */}
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

                            {/* Menu do usuário */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                            <span className="text-xs font-semibold text-white">
                                                {user?.nome?.charAt(0) || 'A'}
                                            </span>
                                        </div>
                                        <span className="text-sm text-slate-700 hidden sm:inline">
                                            {user?.nome?.split(' ')[0]}
                                        </span>
                                    </div>
                                    <span className="h-4 w-px bg-slate-200"></span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-slate-500 hover:text-red-600 transition-colors"
                                        title="Sair"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Conteúdo principal */}
                <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                    {/* Header da página */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-200/50">
                                <Shield className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800">
                                Painel de Administração
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 ml-14">
                            Gerencie os acessos de consultores do sistema.
                        </p>
                    </div>

                    {/* Card de estatísticas rápidas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Total de usuários</p>
                                    <p className="text-2xl font-semibold text-slate-800">{users.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Administradores</p>
                                    <p className="text-2xl font-semibold text-slate-800">
                                        {users.filter(u => u.role === 'Admin').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                                    <UserIcon className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Consultores</p>
                                    <p className="text-2xl font-semibold text-slate-800">
                                        {users.filter(u => u.role !== 'Admin').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card da tabela de usuários */}
                    <div className="bg-white rounded-xl shadow-lg shadow-slate-200/60 border border-slate-200 overflow-hidden">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
                                    <p className="text-sm text-slate-500">Carregando usuários...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Usuário
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Papel
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {(Array.isArray(users) ? users : []).map((u) => (
                                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-9 w-9 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm ${u.role === 'Admin'
                                                            ? 'from-purple-500 to-purple-600'
                                                            : 'from-blue-500 to-indigo-600'
                                                            }`}>
                                                            <span className="text-sm font-semibold text-white">
                                                                {u.nome?.charAt(0) || 'U'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-800">{u.nome}</div>
                                                            <div className="text-xs text-slate-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${u.role === 'Admin'
                                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                        : 'bg-green-50 text-green-700 border border-green-200'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        disabled={u.id === user.id}
                                                        className={`p-2 rounded-lg transition-all ${u.id === user.id
                                                            ? 'text-slate-300 cursor-not-allowed'
                                                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                            }`}
                                                        title={u.id === user.id ? 'Você não pode excluir sua própria conta' : 'Excluir usuário'}
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Rodapé da página */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            Total de {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Admin;