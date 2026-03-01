import api from './axios';
import { type User } from '@shared/index';

export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        accessToken: string;
        refreshToken: string;
    }
}

export const authApi = {
    login: async (credentials: any): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    register: async (userData: any): Promise<any> => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    verifyEmail: async (token: string): Promise<any> => {
        const response = await api.get(`/auth/verify?token=${token}`);
        return response.data;
    }
};
