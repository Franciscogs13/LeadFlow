import { api } from './client';
import type { AuthResponse, User } from '../types';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/login', { email, password });
    return data;
};

export const register = async (nome: string, email: string, password: string, role: string): Promise<AuthResponse> => {
    const { data } = await api.post('/register', { nome, email, password, role });
    return data;
};

export const getMe = async (): Promise<User> => {
    const { data } = await api.get('/me');
    return data;
};

export const updateProfile = async (id: number, nome: string, email: string, password?: string): Promise<User> => {
    const payload: any = { nome, email };
    if (password) payload.password = password;
    const { data } = await api.put(`/users/${id}`, payload);
    return data;
};

export const getUsers = async (): Promise<User[]> => {
    const { data } = await api.get('/users');
    if (data && Array.isArray(data.users)) {
        return data.users;
    }
    return Array.isArray(data) ? data : [];
};

export const deleteUser = async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
};
