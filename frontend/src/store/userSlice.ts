import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@shared/index';

interface UserState {
    currentUser: User | null;
    isAuthenticated: boolean;
    token: string | null;
}

const initialState: UserState = {
    currentUser: null,
    isAuthenticated: false,
    token: localStorage.getItem('token'),
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setCredentials: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.currentUser = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
        },
        logout: (state) => {
            state.currentUser = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
    },
});

export const { setCredentials, logout } = userSlice.actions;

export default userSlice.reducer;
