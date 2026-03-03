import api from './axios';

export const majorApi = {
    getMajors: async () => {
        const response = await api.get('/majors');
        return response.data;
    },
    createMajor: async (name: string) => {
        const response = await api.post('/majors', { name });
        return response.data;
    }
};
