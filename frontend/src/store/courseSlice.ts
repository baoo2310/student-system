import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { courseApi, type CreateCoursePayload, type SchedulePayload } from '../api/course.api';
import type { Course, CourseSchedule } from '@shared/index';

interface CourseState {
    courses: Course[];
    instructorCourses: Course[];
    currentCourse: Course | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CourseState = {
    courses: [],
    instructorCourses: [],
    currentCourse: null,
    isLoading: false,
    error: null,
};

// --- Async Thunks ---

export const fetchAllCourses = createAsyncThunk(
    'course/fetchAll',
    async (majorId?: string) => {
        const response = await courseApi.getAllCourses(majorId);
        return response.data;
    }
);

export const fetchInstructorCourses = createAsyncThunk(
    'course/fetchInstructorCourses',
    async () => {
        const response = await courseApi.getInstructorCourses();
        return response.data;
    }
);

export const fetchCourseById = createAsyncThunk(
    'course/fetchById',
    async (id: string) => {
        const response = await courseApi.getCourseById(id);
        return response.data;
    }
);

export const createCourse = createAsyncThunk(
    'course/create',
    async (payload: CreateCoursePayload) => {
        const response = await courseApi.createCourse(payload);
        return response.data;
    }
);

export const updateCourse = createAsyncThunk(
    'course/update',
    async ({ id, payload }: { id: string; payload: Partial<CreateCoursePayload> }) => {
        const response = await courseApi.updateCourse(id, payload);
        return response.data;
    }
);

export const deleteCourse = createAsyncThunk(
    'course/delete',
    async (id: string) => {
        await courseApi.deleteCourse(id);
        return id;
    }
);

export const addCourseSchedule = createAsyncThunk(
    'course/addSchedule',
    async ({ courseId, payload }: { courseId: string; payload: SchedulePayload }) => {
        const response = await courseApi.addSchedule(courseId, payload);
        return response.data;
    }
);

export const removeCourseSchedule = createAsyncThunk(
    'course/removeSchedule',
    async ({ courseId, scheduleId }: { courseId: string; scheduleId: string }) => {
        await courseApi.removeSchedule(courseId, scheduleId);
        return scheduleId;
    }
);

// --- Slice ---

export const courseSlice = createSlice({
    name: 'course',
    initialState,
    reducers: {
        clearCurrentCourse: (state) => {
            state.currentCourse = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllCourses
            .addCase(fetchAllCourses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
                state.isLoading = false;
                state.courses = action.payload;
            })
            .addCase(fetchAllCourses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch courses';
            })
            // fetchInstructorCourses
            .addCase(fetchInstructorCourses.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchInstructorCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
                state.isLoading = false;
                state.instructorCourses = action.payload;
            })
            .addCase(fetchInstructorCourses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch instructor courses';
            })
            // fetchCourseById
            .addCase(fetchCourseById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCourseById.fulfilled, (state, action: PayloadAction<Course>) => {
                state.isLoading = false;
                state.currentCourse = action.payload;
            })
            .addCase(fetchCourseById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch course details';
            })
            // createCourse
            .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
                state.instructorCourses.unshift(action.payload);
            })
            // updateCourse
            .addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
                const index = state.instructorCourses.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.instructorCourses[index] = action.payload;
                }
                if (state.currentCourse?.id === action.payload.id) {
                    state.currentCourse = { ...state.currentCourse, ...action.payload };
                }
            })
            // deleteCourse
            .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string>) => {
                state.instructorCourses = state.instructorCourses.filter(c => c.id !== action.payload);
            })
            // addCourseSchedule
            .addCase(addCourseSchedule.fulfilled, (state, action: PayloadAction<CourseSchedule>) => {
                if (state.currentCourse) {
                    state.currentCourse.schedules = [...(state.currentCourse.schedules || []), action.payload];
                }
            })
            // removeCourseSchedule
            .addCase(removeCourseSchedule.fulfilled, (state, action: PayloadAction<string>) => {
                if (state.currentCourse && state.currentCourse.schedules) {
                    state.currentCourse.schedules = state.currentCourse.schedules.filter(s => s.id !== action.payload);
                }
            });
    }
});

export const { clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
