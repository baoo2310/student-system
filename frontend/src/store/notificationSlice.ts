import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { notificationApi, type Notification } from '../api/notification.api';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
}

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
    'notification/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const data = await notificationApi.getNotifications();
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
        }
    }
);

export const markNotificationAsRead = createAsyncThunk(
    'notification/markAsRead',
    async (id: string, { rejectWithValue }) => {
        try {
            const data = await notificationApi.markAsRead(id);
            return data.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read');
        }
    }
);

export const markAllNotificationsAsRead = createAsyncThunk(
    'notification/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationApi.markAllAsRead();
            return true;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || 'Failed to mark all as read');
        }
    }
);

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        clearNotifications: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
            state.error = null;
        },
        // We'll dispatch this from a socket listener event later
        addNotification: (state, action: PayloadAction<Notification>) => {
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<Notification[]>) => {
                state.isLoading = false;
                state.notifications = action.payload;
                state.unreadCount = action.payload.filter((n) => !n.isRead).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Mark Single Read
            .addCase(markNotificationAsRead.fulfilled, (state, action: PayloadAction<Notification>) => {
                const index = state.notifications.findIndex((n) => n.id === action.payload.id);
                if (index !== -1 && !state.notifications[index].isRead) {
                    state.notifications[index].isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            // Mark All Read
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => n.isRead = true);
                state.unreadCount = 0;
            });
    }
});

export const { clearNotifications, addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
