import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UserRole } from '@shared/index';
import type { Major } from '@shared/index';
import type { RootState } from '../../store/store';
import { updateProfileSuccess, updateMajorsSuccess } from '../../store/userSlice';
import { useTheme } from '../../hooks/useTheme';
import toast from 'react-hot-toast';
import { majorApi } from '../../api/major.api';
import { profileApi } from '../../api/profile.api';

import CreatableSelect from 'react-select/creatable';

export default function GeneralTab() {
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state: RootState) => state.user);
    const { resolvedTheme } = useTheme();

    const [isLoading, setIsLoading] = useState(false);
    const [allMajors, setAllMajors] = useState<Major[]>([]);

    const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
    const [bio, setBio] = useState(currentUser?.profile?.bio || '');
    const [hourlyRate, setHourlyRate] = useState(currentUser?.profile?.hourlyRate || '');

    // Instead of string[], we keep { label, value } for react-select
    const [selectedMajors, setSelectedMajors] = useState<{ label: string; value: string }[]>(
        currentUser?.majors?.map(m => ({ label: m.name, value: m.id })) || []
    );

    useEffect(() => {
        const fetchMajors = async () => {
            try {
                const data = await majorApi.getMajors();
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
            const data = await profileApi.updateProfile({
                avatarUrl,
                bio,
                hourlyRate: hourlyRate === '' ? null : Number(hourlyRate)
            });

            if (data.success) {
                dispatch(updateProfileSuccess(data.data));
                toast.success('Profile updated successfully!');
            }
        } catch (err: any) {
            console.error(err);
            // toast handles the errors via interceptor mostly
        } finally {
            setIsLoading(false);
        }
    };

    const handleMajorsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const majorIds = selectedMajors.map(m => m.value);
            const data = await profileApi.updateProfileMajors(majorIds);

            if (data.success) {
                dispatch(updateMajorsSuccess(data.data));
                toast.success('Subjects updated successfully!');
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateMajor = async (inputValue: string) => {
        setIsLoading(true);
        try {
            // Using the new majorApi method instead of direct ad-hoc api post
            const data = await majorApi.createMajor(inputValue);

            if (data.success) {
                const newMajor = data.data;
                const newOption = { label: newMajor.name, value: newMajor.id };
                setAllMajors(prev => [...prev, newMajor]);
                setSelectedMajors(prev => [...prev, newOption]);
                toast.success(`Created new subject: ${inputValue}`);
            }
        } catch (err: any) {
            console.error('Failed to create major:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentUser) return null;

    // React-select options formatting
    const majorOptions = allMajors.map(m => ({ label: m.name, value: m.id }));

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
                    {currentUser.role === UserRole.INSTRUCTOR
                        ? 'Select or create areas to help us match you with the right people.'
                        : 'Select the areas you want to learn.'}
                </p>

                <form onSubmit={handleMajorsSubmit}>
                    <div className="mb-6">
                        {currentUser.role === UserRole.INSTRUCTOR ? (
                            <CreatableSelect
                                isMulti
                                isLoading={isLoading}
                                options={majorOptions}
                                value={selectedMajors}
                                onChange={(newValue) => setSelectedMajors(newValue as any)}
                                onCreateOption={handleCreateMajor}
                                placeholder="Search or type to create..."
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: resolvedTheme === 'dark' ? '#374151' : 'white',
                                        borderColor: resolvedTheme === 'dark' ? '#4B5563' : '#D1D5DB', // gray-600 vs gray-300
                                        borderRadius: '0.5rem',
                                        padding: '2px',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            borderColor: '#3B82F6' // blue-500
                                        }
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: resolvedTheme === 'dark' ? '#1F2937' : 'white', // gray-800
                                        color: resolvedTheme === 'dark' ? '#F3F4F6' : '#111827', // gray-100 vs gray-900
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused
                                            ? (resolvedTheme === 'dark' ? '#374151' : '#F3F4F6') // gray-700 vs gray-100
                                            : 'transparent',
                                        color: resolvedTheme === 'dark' ? '#F3F4F6' : '#111827',
                                        '&:active': {
                                            backgroundColor: resolvedTheme === 'dark' ? '#4B5563' : '#E5E7EB', // gray-600 vs gray-200
                                        }
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: resolvedTheme === 'dark' ? '#4B5563' : '#E5E7EB', // gray-600 vs gray-200
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: resolvedTheme === 'dark' ? '#F9FAFB' : '#111827', // gray-50 vs gray-900
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: resolvedTheme === 'dark' ? '#F9FAFB' : '#111827',
                                        ':hover': {
                                            backgroundColor: resolvedTheme === 'dark' ? '#EF4444' : '#F87171', // red-500 vs red-400
                                            color: 'white',
                                        },
                                    }),
                                }}
                            />
                        ) : (
                            <CreatableSelect
                                isMulti
                                isLoading={isLoading}
                                options={majorOptions}
                                value={selectedMajors}
                                onChange={(newValue) => setSelectedMajors(newValue as any)}
                                placeholder="Search subjects..."
                                // Students cannot create subjects, they can only search
                                isValidNewOption={() => false}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        backgroundColor: resolvedTheme === 'dark' ? '#374151' : 'white',
                                        borderColor: resolvedTheme === 'dark' ? '#4B5563' : '#D1D5DB', // gray-600 vs gray-300
                                        borderRadius: '0.5rem',
                                        padding: '2px',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            borderColor: '#3B82F6' // blue-500
                                        }
                                    }),
                                    menu: (base) => ({
                                        ...base,
                                        backgroundColor: resolvedTheme === 'dark' ? '#1F2937' : 'white', // gray-800
                                        color: resolvedTheme === 'dark' ? '#F3F4F6' : '#111827', // gray-100 vs gray-900
                                    }),
                                    option: (base, state) => ({
                                        ...base,
                                        backgroundColor: state.isFocused
                                            ? (resolvedTheme === 'dark' ? '#374151' : '#F3F4F6') // gray-700 vs gray-100
                                            : 'transparent',
                                        color: resolvedTheme === 'dark' ? '#F3F4F6' : '#111827',
                                        '&:active': {
                                            backgroundColor: resolvedTheme === 'dark' ? '#4B5563' : '#E5E7EB', // gray-600 vs gray-200
                                        }
                                    }),
                                    multiValue: (base) => ({
                                        ...base,
                                        backgroundColor: resolvedTheme === 'dark' ? '#4B5563' : '#E5E7EB', // gray-600 vs gray-200
                                    }),
                                    multiValueLabel: (base) => ({
                                        ...base,
                                        color: resolvedTheme === 'dark' ? '#F9FAFB' : '#111827', // gray-50 vs gray-900
                                    }),
                                    multiValueRemove: (base) => ({
                                        ...base,
                                        color: resolvedTheme === 'dark' ? '#F9FAFB' : '#111827',
                                        ':hover': {
                                            backgroundColor: resolvedTheme === 'dark' ? '#EF4444' : '#F87171', // red-500 vs red-400
                                            color: 'white',
                                        },
                                    }),
                                }}
                            />
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
