import api from './axios';

export const settingsApi = {
    updatePassword: async (data: any) => {
        const response = await api.put('/settings/password', data);
        return response.data;
    },
    deleteAccount: async (password: string) => {
        const response = await api.delete('/settings/account', {
            data: { password }
        });
        return response.data;
    }
};
