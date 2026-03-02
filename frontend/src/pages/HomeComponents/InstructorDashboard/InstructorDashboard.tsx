import { useDispatch, useSelector } from 'react-redux';
import { fetchInstructorCourses } from '../../../store/courseSlice';
import type { RootState, AppDispatch } from '../../../store/store';
import { UserGroupIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { matchApi } from '../../../api/match.api';

export default function InstructorDashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const { instructorCourses, isLoading: isCoursesLoading } = useSelector((state: RootState) => state.course);

    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [isLoadingMatches, setIsLoadingMatches] = useState(true);

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
            setIsLoadingMatches(false);
        }
    };

    useEffect(() => {
        fetchMatches();
        dispatch(fetchInstructorCourses());
    }, [dispatch]);

    const handleUpdateStatus = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
        try {
            await matchApi.updateMatchStatus(id, status);
            toast.success(`Match request ${status.toLowerCase()}!`);
            fetchMatches();
        } catch (err: any) {
            console.error(err);
            toast.error(err?.response?.data?.message || `Failed to ${status.toLowerCase()} request.`);
        }
    };

    return (
        <div className="space-y-6">

            {/* Teaching Overview */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Teaching Overview</h2>
                    <Link to="/courses/create" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors">
                        + Create New Course
                    </Link>
                </div>

                {isCoursesLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : instructorCourses.length === 0 ? (
                    <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any courses yet.</p>
                        <Link to="/courses/create" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                            Create First Course
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {instructorCourses.slice(0, 3).map((course) => (
                            <Link key={course.id} to={`/my-courses`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow group block">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {course.major?.name || 'General Subject'}
                                </p>

                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="text-center flex flex-col items-center">
                                        <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 w-10 h-10 rounded-full mb-1">
                                            <UserGroupIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white leading-none mb-1">{course._count?.enrollments || 0}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Students</p>
                                    </div>
                                    <div className="text-center flex flex-col items-center">
                                        <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/30 w-10 h-10 rounded-full mb-1">
                                            <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400 leading-none mb-1">{Number(course.price)}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Price</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Incoming Match Requests */}
            <section>
                <div className="flex items-center justify-between mb-4 mt-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Incoming Student Requests</h2>
                    <Link to="/matches" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                        View All
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                    {isLoadingMatches ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading requests...</div>
                    ) : pendingRequests.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">No pending requests at the moment.</div>
                    ) : (
                        pendingRequests.slice(0, 3).map((request) => (
                            <div key={request.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{request.student.username}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Requesting mentoring for {request.major ? request.major.name : 'General Subject'}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleUpdateStatus(request.id, 'ACCEPTED')}
                                        className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-900/50 rounded-md transition-colors"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(request.id, 'REJECTED')}
                                        className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-md transition-colors"
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

        </div>
    );
}
