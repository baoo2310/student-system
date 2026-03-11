import api from './axios';

export interface ScheduleEvent {
    id: string;
    courseId: string;
    dayOfWeek: string;
    startTime: string; // e.g., "10:00"
    endTime: string;   // e.g., "11:30"
    meetingLink?: string | null;
    isRecurring: boolean;
    courseDetails?: {
        id: string;
        title: string;
    };
}

export const scheduleApi = {
    getMySchedule: async (): Promise<{ success: boolean; data: ScheduleEvent[] }> => {
        const response = await api.get('/schedule/my-schedule');
        return response.data;
    },

    createSchedule: async (payload: {
        courseId: string;
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        meetingLink?: string;
    }): Promise<{ success: boolean; data: ScheduleEvent }> => {
        const response = await api.post('/schedule', payload);
        return response.data;
    }
};
