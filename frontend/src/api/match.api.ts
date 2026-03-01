import api from './axios';

export interface MatchRequestPayload {
    instructorId: string;
    majorId?: string;
    message?: string;
}

export const matchApi = {
    getAvailableInstructors: async (majorId?: string) => {
        const url = majorId ? `/matches/instructors?majorId=${majorId}` : '/matches/instructors';
        const response = await api.get(url);
        return response.data;
    },

    createMatchRequest: async (payload: MatchRequestPayload) => {
        const response = await api.post('/matches', payload);
        return response.data;
    },

    getUserMatches: async () => {
        const response = await api.get('/matches');
        return response.data;
    },

    updateMatchStatus: async (id: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => {
        const response = await api.put(`/matches/${id}/status`, { status });
        return response.data;
    }
};
