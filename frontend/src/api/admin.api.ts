import api from './axios';
import { UserRole } from '@shared/index';

export const adminApi = {
    getPlatformStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getAllUsers: async (params?: { role?: string; active?: boolean; search?: string }) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    updateUserRole: async (userId: string, role: UserRole) => {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    toggleUserStatus: async (userId: string) => {
        const response = await api.put(`/admin/users/${userId}/status`);
        return response.data;
    }
};
