import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://127.0.0.1:5000',
});

// Interceptador para injeção de token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@LeadApp:Token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
