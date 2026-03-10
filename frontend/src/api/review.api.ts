import api from './axios';

export interface CreateReviewPayload {
    courseId: string;
    rating: number;
    comment?: string;
}

export const reviewApi = {
    createReview: async (payload: CreateReviewPayload) => {
        const response = await api.post('/reviews', payload);
        return response.data;
    },

    getCourseReviews: async (courseId: string) => {
        const response = await api.get(`/reviews/course/${courseId}`);
        return response.data;
    },

    deleteReview: async (id: string) => {
        const response = await api.delete(`/reviews/${id}`);
        return response.data;
    }
};
