import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { adminApi } from '../api/admin.api';
import { UserRole } from '@shared/index';

export interface AdminUser {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    avatarUrl: string | null;
    createdAt: string;
}

export interface PlatformStats {
    totalUsers: number;
    totalCourses: number;
    activeEnrollments: number;
    pendingMatches: number;
}

interface AdminState {
    users: AdminUser[];
    stats: PlatformStats | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: AdminState = {
    users: [],
    stats: null,
    isLoading: false,
    error: null,
};

export const fetchPlatformStats = createAsyncThunk(
    'admin/fetchStats',
    async () => {
        const response = await adminApi.getPlatformStats();
        return response.data;
    }
);

export const fetchAllUsers = createAsyncThunk(
    'admin/fetchUsers',
    async (params?: { role?: string; active?: boolean; search?: string }) => {
        const response = await adminApi.getAllUsers(params);
        return response.data;
    }
);

export const updateUserRole = createAsyncThunk(
    'admin/updateRole',
    async ({ userId, role }: { userId: string; role: UserRole }) => {
        const response = await adminApi.updateUserRole(userId, role);
        return response.data;
    }
);

export const toggleUserStatus = createAsyncThunk(
    'admin/toggleStatus',
    async (userId: string) => {
        const response = await adminApi.toggleUserStatus(userId);
        return response.data;
    }
);

export const adminSlice = createSlice({
    name: 'admin',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Stats
            .addCase(fetchPlatformStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPlatformStats.fulfilled, (state, action: PayloadAction<PlatformStats>) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchPlatformStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch platform stats';
            })
            // Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<AdminUser[]>) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch users';
            })
            // Update Role
            .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<{ id: string, username: string, role: UserRole }>) => {
                const user = state.users.find(u => u.id === action.payload.id);
                if (user) {
                    user.role = action.payload.role;
                }
            })
            // Toggle Status
            .addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<{ id: string, username: string, isActive: boolean }>) => {
                const user = state.users.find(u => u.id === action.payload.id);
                if (user) {
                    user.isActive = action.payload.isActive;
                }
            });
    }
});

export default adminSlice.reducer;
