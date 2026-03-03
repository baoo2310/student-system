import { useState } from 'react';
import toast from 'react-hot-toast';
import { profileApi } from '../../api/profile.api';

export default function SecurityTab() {

    const [isLoading, setIsLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setIsLoading(true);

        try {
            const data = await profileApi.updatePassword({
                oldPassword,
                newPassword
            });

            if (data.success) {
                toast.success('Password updated successfully!');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-2 dark:text-gray-200">Change Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Ensure your new password is at least 6 characters long.
                </p>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                        <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                        />
                    </div>

                    <hr className="border-gray-200 dark:border-gray-700 my-4" />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                        className="w-full py-2 px-4 bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 mt-4"
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
