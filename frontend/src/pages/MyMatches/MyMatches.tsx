import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { matchApi } from '../../api/match.api';
import toast from 'react-hot-toast';

export default function MyMatches() {
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [matches, setMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMatches = async () => {
        setIsLoading(true);
        try {
            const data = await matchApi.getUserMatches();
            if (data.success) {
                setMatches(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch matches:', err);
            toast.error('Failed to load match requests.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => {
        try {
            await matchApi.updateMatchStatus(id, status);
            toast.success(`Match request ${status.toLowerCase()}!`);
            // Refresh list
            fetchMatches();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || `Failed to ${status.toLowerCase()} request.`);
        }
    };

    if (!currentUser) return null;

    const isInstructor = currentUser.role === 'INSTRUCTOR';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Matches</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {isInstructor
                        ? 'Manage your incoming match requests from students.'
                        : 'Track the status of your match requests with instructors.'}
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center my-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 w-full animate-fade-in">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40 mb-4">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <p className="text-xl text-gray-500 dark:text-gray-400">No match requests found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {matches.map((match) => {
                        // Determine the other user's profile to display
                        const otherParty = isInstructor ? match.student : match.instructor;

                        let statusColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
                        if (match.status === 'ACCEPTED') statusColor = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
                        if (match.status === 'REJECTED') statusColor = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
                        if (match.status === 'COMPLETED') statusColor = 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';

                        return (
                            <div key={match.id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 flex flex-col">

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        {otherParty.avatarUrl ? (
                                            <img src={otherParty.avatarUrl} alt={otherParty.username} className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                                {otherParty.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                                                {isInstructor ? 'Student' : 'Instructor'}
                                            </p>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white">{otherParty.username}</h3>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                                        {match.status}
                                    </span>
                                </div>

                                {match.major && (
                                    <div className="mb-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                            Subject: {match.major.name}
                                        </span>
                                    </div>
                                )}

                                {match.message && (
                                    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300 mb-4 flex-grow border border-gray-100 dark:border-gray-700">
                                        "{match.message}"
                                    </div>
                                )}

                                <div className="text-xs text-gray-400 dark:text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                    Requested on: {new Date(match.createdAt).toLocaleDateString()}
                                </div>

                                {/* Actions for Instructors */}
                                {isInstructor && match.status === 'PENDING' && (
                                    <div className="mt-4 flex space-x-3">
                                        <button
                                            onClick={() => handleUpdateStatus(match.id, 'ACCEPTED')}
                                            className="flex-1 py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(match.id, 'REJECTED')}
                                            className="flex-1 py-1.5 px-3 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:text-white hover:bg-red-600 border border-red-200 dark:border-red-900 text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}

                                {isInstructor && match.status === 'ACCEPTED' && (
                                    <div className="mt-4">
                                        <button
                                            onClick={() => handleUpdateStatus(match.id, 'COMPLETED')}
                                            className="w-full py-1.5 px-3 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                            Mark as Completed
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
