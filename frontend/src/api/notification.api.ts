import api from './axios';

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    body?: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationApi = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },

    markAsRead: async (id: string) => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.patch('/notifications/mark-all-read');
        return response.data;
    }
};
