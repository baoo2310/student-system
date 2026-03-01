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
    token: null,
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
        },
        updateProfileSuccess: (state, action: PayloadAction<User>) => {
            state.currentUser = action.payload;
        },
        updateMajorsSuccess: (state, action: PayloadAction<any[]>) => {
            if (state.currentUser) {
                state.currentUser.majors = action.payload;
            }
        },
        logout: (state) => {
            state.currentUser = null;
            state.token = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setCredentials, logout, updateProfileSuccess, updateMajorsSuccess } = userSlice.actions;

export default userSlice.reducer;
