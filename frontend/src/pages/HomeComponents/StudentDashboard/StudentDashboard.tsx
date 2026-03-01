import { useState, useEffect } from 'react';
import { matchApi } from '../../../api/match.api';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const data = await matchApi.getUserMatches();
                if (data.success) {
                    // Filter for PENDING status
                    setPendingRequests(data.data.filter((m: any) => m.status === 'PENDING'));
                }
            } catch (err) {
                console.error('Failed to fetch matches:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMatches();
    }, []);

    return (
        <div className="space-y-6">

            {/* Active Courses Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Active Courses</h2>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        View All
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Mock Course Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className="inline-flex items-center rounded-md bg-green-50 dark:bg-green-900/30 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                                Active
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Comp Sci</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Introduction to Algorithms</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            Master the fundamentals of algorithmic design and analysis.
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Instructor:</span>&nbsp;Dr. Ada Lovelace
                        </div>
                    </div>
                </div>
            </section>

            {/* Pending Requests Section */}
            <section>
                <div className="flex items-center justify-between mb-4 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Match Requests</h2>
                    <Link to="/matches" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        View All
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    {isLoading ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading requests...</div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">You have no pending requests at the moment.</div>
                    ) : (
                        pendingRequests.slice(0, 3).map((request) => (
                            <div key={request.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{request.instructor.username}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Mentoring for {request.major ? request.major.name : 'General Subject'}
                                    </p>
                                </div>
                                <span className="inline-flex items-center rounded-md bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-500 ring-1 ring-inset ring-yellow-600/20">
                                    Pending
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}
