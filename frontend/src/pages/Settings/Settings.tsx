import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { AppDispatch } from '../../store/store';
import { logout } from '../../store/userSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
    Cog6ToothIcon,
    KeyIcon,
    ExclamationTriangleIcon,
    MoonIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../hooks/useTheme';

export default function Settings() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    // Password Update State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Account Deletion State
    const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const res = await api.put('/settings/password', { currentPassword, newPassword });
            if (res.data.success) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        const confirmed = window.confirm(
            'Are you absolutely sure you want to delete your account? This action CANNOT be undone, and all your data (courses, enrollments, profile) will be lost.'
        );
        if (!confirmed) return;

        setIsDeletingAccount(true);
        try {
            const res = await api.delete('/settings/account', {
                data: { confirmPassword: deleteConfirmPassword } // axios delete requires payload in 'data' field
            });
            if (res.data.success) {
                toast.success('Account permanently deleted');
                dispatch(logout());
                navigate('/login');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setIsDeletingAccount(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Cog6ToothIcon className="w-8 h-8 mr-3 text-gray-600 dark:text-gray-400" />
                    Account Settings
                </h1>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Manage your preferences, security, and account status.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Lateral Navigation (Optional, skipped for simplicity, just stack cards) */}
                <div className="md:col-span-3 space-y-8">

                    {/* Preferences Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center">
                            <MoonIcon className="w-5 h-5 text-indigo-500 mr-2" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preferences</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Appearance</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select your preferred theme</p>
                                </div>
                                <select
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                                    className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="system">System Default</option>
                                    <option value="light">Light Mode</option>
                                    <option value="dark">Dark Mode</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Security Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex items-center">
                            <KeyIcon className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Security</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50 inline-flex items-center"
                                >
                                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-red-200 dark:border-red-900 overflow-hidden">
                        <div className="px-6 py-5 border-b border-red-100 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-500 mr-2" />
                            <h3 className="text-lg font-bold text-red-800 dark:text-red-400">Danger Zone</h3>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Once you delete your account, there is no going back. Please be certain.
                            </p>
                            <form onSubmit={handleDeleteAccount} className="max-w-md">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password to Delete Account</label>
                                <div className="flex gap-4">
                                    <input
                                        type="password"
                                        required
                                        value={deleteConfirmPassword}
                                        onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                                        className="flex-1 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-red-500 focus:border-red-500 text-sm py-2 px-3"
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isDeletingAccount}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
