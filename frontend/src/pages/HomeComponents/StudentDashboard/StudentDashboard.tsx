import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyEnrollments } from '../../../store/enrollmentSlice';
import type { RootState, AppDispatch } from '../../../store/store';
import { matchApi } from '../../../api/match.api';
import type { MatchRequest } from '@shared/index';

export default function StudentDashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const { myEnrollments, isLoading: isEnrollmentsLoading } = useSelector((state: RootState) => state.enrollment);

    const [pendingRequests, setPendingRequests] = useState<MatchRequest[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);

    useEffect(() => {
        dispatch(fetchMyEnrollments());

        const fetchMatches = async () => {
            try {
                const data = await matchApi.getUserMatches();
                if (data.success) {
                    // Filter for PENDING status
                    setPendingRequests(data.data.filter((m: MatchRequest) => m.status === 'PENDING'));
                }
            } catch (err) {
                console.error('Failed to fetch matches:', err);
            } finally {
                setIsLoadingMatches(false);
            }
        };

        fetchMatches();
    }, [dispatch]);

    return (
        <div className="space-y-6">

            {/* Active Courses Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Active Courses</h2>
                    <Link to="/courses" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        Browse Courses
                    </Link>
                </div>

                {isEnrollmentsLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : myEnrollments.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400">You are not enrolled in any courses yet.</p>
                        <Link to="/courses" className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline">
                            Explore Catalog
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myEnrollments.map((enrollment) => (
                            <Link
                                key={enrollment.id}
                                to={`/courses/${enrollment.courseId}`}
                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow group block"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${enrollment.status === 'ACTIVE'
                                        ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400'
                                        : enrollment.status === 'COMPLETED'
                                            ? 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-700 dark:text-gray-300'
                                        }`}>
                                        {enrollment.status}
                                    </span>
                                    {enrollment.course?.major && (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {enrollment.course.major.name}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {enrollment.course?.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                                    {enrollment.course?.description || 'No description available.'}
                                </p>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span className="font-medium mr-1">Instructor:</span>
                                    {enrollment.course?.instructor?.username}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
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
                    {isLoadingMatches ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading requests...</div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">You have no pending requests at the moment.</div>
                    ) : (
                        pendingRequests.slice(0, 3).map((request: MatchRequest) => (
                            <div key={request.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{request.instructor.username}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Mentoring for {request.instructor.majors ? request.instructor.majors.map((major: any) => major.name) : 'General Subject'}
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
