import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import courseReducer from './courseSlice';
import enrollmentReducer from './enrollmentSlice';
import adminReducer from './adminSlice';
import reviewReducer from './reviewSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        course: courseReducer,
        enrollment: enrollmentReducer,
        admin: adminReducer,
        review: reviewReducer,
        notification: notificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
