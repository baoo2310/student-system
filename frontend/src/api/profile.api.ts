import api from './axios';

export interface UpdateProfileDto {
    avatarUrl?: string;
    bio?: string;
    hourlyRate?: number | null;
}

export const profileApi = {
    getProfile: async () => {
        const response = await api.get('/profile');
        return response.data;
    },
    updateProfile: async (data: UpdateProfileDto) => {
        const response = await api.put('/profile', data);
        return response.data;
    },
    updateProfileMajors: async (majors: string[]) => {
        const response = await api.put('/profile/majors', { majors });
        return response.data;
    },
    updatePassword: async (data: { oldPassword?: string; newPassword?: string }) => {
        const response = await api.put('/profile', data);
        return response.data;
    }
};
