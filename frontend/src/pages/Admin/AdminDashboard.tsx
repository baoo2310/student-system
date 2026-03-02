import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlatformStats } from '../../store/adminSlice';
import type { RootState, AppDispatch } from '../../store/store';
import {
    UsersIcon,
    AcademicCapIcon,
    BookOpenIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';
import UserManagement from './UserManagement';

export default function AdminDashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const { stats, isLoading, error } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        dispatch(fetchPlatformStats());
    }, [dispatch]);

    const statCards = [
        { name: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { name: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpenIcon, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        { name: 'Active Enrollments', value: stats?.activeEnrollments || 0, icon: AcademicCapIcon, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
        { name: 'Pending Match Requests', value: stats?.pendingMatches || 0, icon: UserGroupIcon, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">Admin Dashboard</span>
                </h1>
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    Platform statistics and system management.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-6 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-10">
                {statCards.map((item) => (
                    <div key={item.name} className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center">
                        <div className={`p-4 rounded-2xl ${item.bg} mr-4`}>
                            <item.icon className={`w-8 h-8 ${item.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.name}</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {isLoading ? (
                                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                ) : (
                                    item.value
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Management</h3>
                </div>
                <div className="p-6">
                    <UserManagement />
                </div>
            </div>
        </div>
    );
}
