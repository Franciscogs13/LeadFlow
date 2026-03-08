import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://api-leadflow.onrender.com',
});

// Interceptador para injeção de token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('@LeadApp:Token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
