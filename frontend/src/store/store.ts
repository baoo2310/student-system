import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import courseReducer from './courseSlice';
import enrollmentReducer from './enrollmentSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        course: courseReducer,
        enrollment: enrollmentReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
