import api from './axios';
import { EnrollmentStatus } from '@shared/index';

export const enrollmentApi = {
    enrollInCourse: async (courseId: string) => {
        const response = await api.post('/enrollments', { courseId });
        return response.data;
    },

    getMyEnrollments: async () => {
        const response = await api.get('/enrollments/my-enrollments');
        return response.data;
    },

    getCourseEnrollments: async (courseId: string) => {
        const response = await api.get(`/enrollments/course/${courseId}`);
        return response.data;
    },

    updateEnrollmentStatus: async (enrollmentId: string, status: EnrollmentStatus) => {
        const response = await api.put(`/enrollments/${enrollmentId}/status`, { status });
        return response.data;
    }
};
