import api from './axios';

export const instructorApi = {
    getInstructors: async (params?: any) => {
        const response = await api.get('/instructors', { params });
        return response.data;
    },
    getInstructorById: async (id: string) => {
        const response = await api.get(`/instructors/${id}`);
        return response.data;
    }
};
