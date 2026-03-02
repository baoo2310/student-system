import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { enrollmentApi } from '../api/enrollment.api';
import type { Enrollment, EnrollmentStatus } from '@shared/index';

interface EnrollmentState {
    myEnrollments: Enrollment[];
    courseEnrollments: Enrollment[];
    isLoading: boolean;
    error: string | null;
}

const initialState: EnrollmentState = {
    myEnrollments: [],
    courseEnrollments: [],
    isLoading: false,
    error: null,
};

// --- Async Thunks ---

export const enrollInCourse = createAsyncThunk(
    'enrollment/enrollInCourse',
    async (courseId: string) => {
        const response = await enrollmentApi.enrollInCourse(courseId);
        return response.data;
    }
);

export const fetchMyEnrollments = createAsyncThunk(
    'enrollment/fetchMyEnrollments',
    async () => {
        const response = await enrollmentApi.getMyEnrollments();
        return response.data;
    }
);

export const fetchCourseEnrollments = createAsyncThunk(
    'enrollment/fetchCourseEnrollments',
    async (courseId: string) => {
        const response = await enrollmentApi.getCourseEnrollments(courseId);
        return response.data;
    }
);

export const updateEnrollmentStatus = createAsyncThunk(
    'enrollment/updateStatus',
    async ({ enrollmentId, status }: { enrollmentId: string; status: EnrollmentStatus }) => {
        const response = await enrollmentApi.updateEnrollmentStatus(enrollmentId, status);
        return response.data;
    }
);

// --- Slice ---

export const enrollmentSlice = createSlice({
    name: 'enrollment',
    initialState,
    reducers: {
        clearCourseEnrollments: (state) => {
            state.courseEnrollments = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchMyEnrollments
            .addCase(fetchMyEnrollments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMyEnrollments.fulfilled, (state, action: PayloadAction<Enrollment[]>) => {
                state.isLoading = false;
                state.myEnrollments = action.payload;
            })
            .addCase(fetchMyEnrollments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch enrollments';
            })
            // fetchCourseEnrollments
            .addCase(fetchCourseEnrollments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCourseEnrollments.fulfilled, (state, action: PayloadAction<Enrollment[]>) => {
                state.isLoading = false;
                state.courseEnrollments = action.payload;
            })
            .addCase(fetchCourseEnrollments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch course enrollments';
            })
            // enrollInCourse
            .addCase(enrollInCourse.fulfilled, (state, action: PayloadAction<Enrollment>) => {
                state.myEnrollments.unshift(action.payload);
            })
            // updateEnrollmentStatus
            .addCase(updateEnrollmentStatus.fulfilled, (state, action: PayloadAction<Enrollment>) => {
                const index = state.courseEnrollments.findIndex(e => e.id === action.payload.id);
                if (index !== -1) {
                    state.courseEnrollments[index] = action.payload;
                }
            });
    }
});

export const { clearCourseEnrollments } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
