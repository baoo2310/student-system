import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewApi, type CreateReviewPayload } from '../api/review.api';
import type { Review } from '@shared/index';

interface ReviewState {
    reviews: Review[];
    avgRating: number;
    totalReviews: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: ReviewState = {
    reviews: [],
    avgRating: 0,
    totalReviews: 0,
    isLoading: false,
    error: null,
};

export const fetchCourseReviews = createAsyncThunk(
    'review/fetchCourseReviews',
    async (courseId: string, { rejectWithValue }) => {
        try {
            const response = await reviewApi.getCourseReviews(courseId);
            return response.data; // { reviews, avgRating, totalReviews }
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
        }
    }
);

export const submitReview = createAsyncThunk(
    'review/submitReview',
    async (payload: CreateReviewPayload, { rejectWithValue }) => {
        try {
            const response = await reviewApi.createReview(payload);
            return response.data; // returns created review
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
        }
    }
);

export const deleteReview = createAsyncThunk(
    'review/deleteReview',
    async (id: string, { rejectWithValue }) => {
        try {
            await reviewApi.deleteReview(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
        }
    }
);

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearReviews: (state) => {
            state.reviews = [];
            state.avgRating = 0;
            state.totalReviews = 0;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch reviews
            .addCase(fetchCourseReviews.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCourseReviews.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews = action.payload.reviews;
                state.avgRating = action.payload.avgRating;
                state.totalReviews = action.payload.totalReviews;
            })
            .addCase(fetchCourseReviews.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Submit review
            .addCase(submitReview.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(submitReview.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reviews.unshift(action.payload);
                state.totalReviews += 1;
                const total = state.reviews.reduce((sum, r) => sum + r.rating, 0);
                state.avgRating = +(total / state.totalReviews).toFixed(1);
            })
            .addCase(submitReview.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Delete review
            .addCase(deleteReview.fulfilled, (state, action) => {
                const deletedId = action.payload;
                const deletedReview = state.reviews.find(r => r.id === deletedId);
                if (deletedReview) {
                    state.reviews = state.reviews.filter(r => r.id !== deletedId);
                    state.totalReviews -= 1;
                    if (state.totalReviews > 0) {
                        const total = state.reviews.reduce((sum, r) => sum + r.rating, 0);
                        state.avgRating = +(total / state.totalReviews).toFixed(1);
                    } else {
                        state.avgRating = 0;
                    }
                }
            });
    }
});

export const { clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;