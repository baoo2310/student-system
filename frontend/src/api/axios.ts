import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { store } from '../store/store';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = store.getState().user.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError<any>) => {
        // Skip automatic error toasts for the refresh token endpoint
        if (error.config?.url?.includes('/auth/refresh')) {
            return Promise.reject(error);
        }

        const data = error.response?.data;

        // Handle array of errors from validation middleware
        if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err: string) => toast.error(err));
        }
        // Handle single error message
        else if (data?.message) {
            toast.error(data.message);
        }
        // Fallback
        else {
            toast.error('An unexpected error occurred');
        }

        return Promise.reject(error);
    }
);

export default api;
