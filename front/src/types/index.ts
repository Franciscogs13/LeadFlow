export type LeadStatus = 'Novo' | 'Em Contato' | 'Convertido';
export type Role = 'Admin' | 'Consultor';

export interface AIChartConfig {
    type: 'bar' | 'pie' | 'line';
    data: any[];
    xAxisKey?: string;
    series: { dataKey: string; color?: string; name?: string }[];
}

export interface AIChatMessage {
    role: 'user' | 'assistant';
    content: string;
    chart?: AIChartConfig;
}

export interface User {
    id: number;
    nome: string;
    email: string;
    role: Role;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Lead {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    origem: string;
    status: LeadStatus;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface LeadFilters {
    search?: string;
    status?: LeadStatus | '';
}
