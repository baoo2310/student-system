import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsers, updateUserRole, toggleUserStatus } from '../../store/adminSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { UserRole } from '@shared/index';
import toast from 'react-hot-toast';

export default function UserManagement() {
    const dispatch = useDispatch<AppDispatch>();
    const { users, isLoading } = useSelector((state: RootState) => state.admin);
    const { currentUser } = useSelector((state: RootState) => state.user);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        dispatch(fetchAllUsers({
            search: searchTerm || undefined,
            role: roleFilter || undefined,
            active: statusFilter ? statusFilter === 'true' : undefined
        }));
    }, [dispatch, searchTerm, roleFilter, statusFilter]);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
        try {
            await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
            toast.success(`Role updated successfully to ${newRole}`);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user role');
        }
    };

    const handleStatusToggle = async (userId: string) => {
        try {
            await dispatch(toggleUserStatus(userId)).unwrap();
            toast.success('User status updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Search username or email..."
                        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 text-sm py-2 px-3"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <select
                        className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        <option value={UserRole.STUDENT}>Students</option>
                        <option value={UserRole.INSTRUCTOR}>Instructors</option>
                        <option value={UserRole.ADMIN}>Admins</option>
                    </select>
                    <select
                        className="rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm py-2 pl-3 pr-8 focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Registered</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 relative">
                        {isLoading && (
                            <tr className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex justify-center items-center z-10 backdrop-blur-sm">
                                <td><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></td>
                            </tr>
                        )}
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                            {user.avatarUrl ? (
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt="" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <span className="text-gray-500 dark:text-gray-400 font-bold">{user.username[0].toUpperCase()}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {currentUser?.id === user.id ? (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                                            ADMIN (You)
                                        </span>
                                    ) : (
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                            className="text-xs font-semibold rounded-full px-2 py-1 border-0 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value={UserRole.STUDENT}>STUDENT</option>
                                            <option value={UserRole.INSTRUCTOR}>INSTRUCTOR</option>
                                            <option value={UserRole.ADMIN}>ADMIN</option>
                                        </select>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {currentUser?.id === user.id ? (
                                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            Active
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleStatusToggle(user.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${user.isActive
                                                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30 dark:hover:bg-green-900/40'
                                                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && !isLoading && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                        No users found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}
