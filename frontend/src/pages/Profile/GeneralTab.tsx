import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UserRole } from '@shared/index';
import type { Major } from '@shared/index';
import type { RootState } from '../../store/store';
import { updateProfileSuccess, updateMajorsSuccess } from '../../store/userSlice';
import toast from 'react-hot-toast';

export default function GeneralTab() {
    const dispatch = useDispatch();
    const { currentUser, token } = useSelector((state: RootState) => state.user);

    const [isLoading, setIsLoading] = useState(false);
    const [allMajors, setAllMajors] = useState<Major[]>([]);

    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
    const [bio, setBio] = useState(currentUser?.profile?.bio || '');
    const [hourlyRate, setHourlyRate] = useState(currentUser?.profile?.hourlyRate || '');
    const [selectedMajors, setSelectedMajors] = useState<string[]>(
        currentUser?.majors?.map(m => m.id) || []
    );

    useEffect(() => {
        // Fetch the available subjects/majors from the backend
        const fetchMajors = async () => {
            try {
                const res = await fetch('http://localhost:3000/api/majors');
                const data = await res.json();
                if (data.success) {
                    setAllMajors(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch majors:', err);
                toast.error('Failed to load subjects.');
            }
        };

        fetchMajors();
    }, []);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    avatarUrl,
                    bio,
                    hourlyRate: hourlyRate === '' ? null : Number(hourlyRate)
                })
            });

            const data = await res.json();

            if (data.success) {
                dispatch(updateProfileSuccess(data.data));
                toast.success('Profile updated successfully!');
            } else {
                toast.error(data.message || data.errors?.[0] || 'Update failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMajorsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:3000/api/profile/majors', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ majorIds: selectedMajors })
            });

            const data = await res.json();

            if (data.success) {
                dispatch(updateMajorsSuccess(data.data));
                toast.success('Subjects updated successfully!');
            } else {
                toast.error(data.message || data.errors?.[0] || 'Update failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMajor = (id: string) => {
        setSelectedMajors(prev =>
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    if (!currentUser) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* Basic Info Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-6 dark:text-gray-200">Basic Information</h2>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                        <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Tell us about yourself..."
                        />
                    </div>

                    {currentUser.role === UserRole.INSTRUCTOR && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hourly Rate ($)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                                placeholder="25.00"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Subjects / Majors Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-2 dark:text-gray-200">
                    {currentUser.role === UserRole.INSTRUCTOR ? 'Subjects You Teach' : 'Subjects of Interest'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Select the areas to help us match you with the right people.
                </p>

                <form onSubmit={handleMajorsSubmit}>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 mb-6">
                        {allMajors.length === 0 ? (
                            <p className="text-sm text-gray-500">No subjects found.</p>
                        ) : (
                            allMajors.map(major => (
                                <label key={major.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedMajors.includes(major.id)}
                                        onChange={() => toggleMajor(major.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-blue-500 transition-colors"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                            {major.name}
                                        </div>
                                        {major.description && (
                                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                {major.description}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Subjects'}
                    </button>
                </form>
            </div>
        </div>
    );
}
