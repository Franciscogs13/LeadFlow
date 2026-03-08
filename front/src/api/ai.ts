import { api } from './client';
import type { AIChatMessage, LeadFilters } from '../types';

export const askAI = async (message: string, contextFilters?: LeadFilters): Promise<AIChatMessage> => {
    // We send the user's message and the current frontend filters as context
    const payload = {
        message,
        context: contextFilters || {}
    };

    const { data } = await api.post('/chat', payload);
    return data;
};
