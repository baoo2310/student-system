import api from './axios';

export interface CreateCoursePayload {
    title: string;
    description?: string;
    price?: number;
    majorId?: string;
}

export interface SchedulePayload {
    dayOfWeek: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    meetingLink?: string;
}

export const courseApi = {
    getAllCourses: async (params?: any) => {
        const response = await api.get('/courses', { params });
        return response.data;
    },

    getInstructorCourses: async () => {
        const response = await api.get('/courses/my-courses');
        return response.data;
    },

    getCourseById: async (id: string) => {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    },

    createCourse: async (payload: CreateCoursePayload) => {
        const response = await api.post('/courses', payload);
        return response.data;
    },

    updateCourse: async (id: string, payload: Partial<CreateCoursePayload>) => {
        const response = await api.put(`/courses/${id}`, payload);
        return response.data;
    },

    deleteCourse: async (id: string) => {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    },

    addSchedule: async (courseId: string, payload: SchedulePayload) => {
        const response = await api.post(`/courses/${courseId}/schedules`, payload);
        return response.data;
    },

    removeSchedule: async (courseId: string, scheduleId: string) => {
        const response = await api.delete(`/courses/${courseId}/schedules/${scheduleId}`);
        return response.data;
    }
};
