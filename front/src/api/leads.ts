import { api } from './client';
import type { Lead, LeadFilters, LeadStatus, PaginatedResponse } from '../types';

export const getLeads = async (
    page: number = 1,
    limit: number = 10,
    filters?: LeadFilters
): Promise<PaginatedResponse<Lead>> => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });

    if (filters?.search) {
        params.append('search', filters.search);
    }

    if (filters?.status) {
        params.append('status', filters.status);
    }

    const { data } = await api.get(`/leads?${params.toString()}`);
    return data;
};

export const exportLeads = async (filters?: LeadFilters): Promise<Lead[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);

    // We send a request to a dedicated export route or pass a flag to get ALL leads
    params.append('export', 'true');

    const { data } = await api.get(`/leads/export?${params.toString()}`);
    return data; // Should return all leads directly
};

export const createLead = async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
    const { data } = await api.post('/leads', lead);
    return data;
};

export const uploadLeads = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    // O axios por padrão com formData já seta o content-type multipart/form-data
    const { data } = await api.post('/leads/upload', formData);
    return data;
};

export const updateLeadStatus = async (id: number, status: LeadStatus): Promise<Lead> => {
    const { data } = await api.put(`/leads/${id}`, { status });
    return data;
};

export const deleteLead = async (id: number): Promise<void> => {
    await api.delete(`/leads/${id}`);
};
