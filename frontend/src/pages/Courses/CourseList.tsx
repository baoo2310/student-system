import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllCourses } from '../../store/courseSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { BookOpenIcon, UserCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios'; // Raw instance for getting majors quickly

export default function CourseList() {
    const dispatch = useDispatch<AppDispatch>();
    const { courses, isLoading, error } = useSelector((state: RootState) => state.course);
    const [majors, setMajors] = useState<any[]>([]);
    const [selectedMajor, setSelectedMajor] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        // Fetch majors for the filter dropdown
        const fetchMajors = async () => {
            try {
                const res = await api.get('/majors');
                if (res.data.success) {
                    setMajors(res.data.data);
                }
            } catch (err) {
                console.error('Failed to load majors', err);
            }
        };
        fetchMajors();
    }, []);

    useEffect(() => {
        dispatch(fetchAllCourses(selectedMajor || undefined));
    }, [dispatch, selectedMajor]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <BookOpenIcon className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" />
                        Browse Courses
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Find the perfect course from our expert instructors.
                    </p>
                </div>

                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <label htmlFor="major-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filter by Subject:
                    </label>
                    <select
                        id="major-filter"
                        value={selectedMajor}
                        onChange={(e) => {
                            setSelectedMajor(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="block w-48 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    >
                        <option value="">All Subjects</option>
                        {majors.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md mb-6 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <BookOpenIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No courses found</h3>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">
                        {selectedMajor ? 'Try selecting a different subject.' : 'There are no courses available at the moment.'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                        {courses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((course) => (
                            <Link
                                key={course.id}
                                to={`/courses/${course.id}`}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group"
                            >
                                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 px-6 py-4 flex flex-col justify-end relative overflow-hidden">
                                    {/* Decorative circle */}
                                    <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                                    {course.major && (
                                        <span className="inline-block w-max px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full mb-2 border border-white/20">
                                            {course.major.name}
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-100 transition-colors">
                                        {course.title}
                                    </h3>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-1">
                                        {course.description || 'No description provided.'}
                                    </p>

                                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white">
                                                {course.instructor?.avatarUrl ? (
                                                    <img src={course.instructor.avatarUrl} alt="" className="w-6 h-6 rounded-full mr-2 object-cover border border-gray-200 dark:border-gray-600" />
                                                ) : (
                                                    <UserCircleIcon className="w-6 h-6 mr-2 text-gray-400" />
                                                )}
                                                {course.instructor?.username}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
                                                <CurrencyDollarIcon className="w-5 h-5 mr-1 text-green-600 dark:text-green-400" />
                                                <span className="font-semibold text-gray-900 dark:text-white">{Number(course.price)}</span>
                                            </div>
                                            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg">
                                                {course._count?.enrollments || 0} enrolled
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {courses.length > ITEMS_PER_PAGE && (
                        <div className="flex justify-center items-center space-x-2 pb-10">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Page {currentPage} of {Math.ceil(courses.length / ITEMS_PER_PAGE)}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(Math.ceil(courses.length / ITEMS_PER_PAGE), p + 1))}
                                disabled={currentPage === Math.ceil(courses.length / ITEMS_PER_PAGE)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
