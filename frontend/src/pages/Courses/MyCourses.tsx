import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchInstructorCourses, deleteCourse } from '../../store/courseSlice';
import type { RootState, AppDispatch } from '../../store/store';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    AcademicCapIcon,
    UsersIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function MyCourses() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { instructorCourses: courses, isLoading, error } = useSelector((state: RootState) => state.course);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchInstructorCourses());
    }, [dispatch]);

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(id);
        try {
            await dispatch(deleteCourse(id)).unwrap();
            toast.success('Course deleted successfully');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete course');
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                        <AcademicCapIcon className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400" />
                        My Courses
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        Manage your teaching catalog and schedules.
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <button
                        onClick={() => navigate('/courses/create')}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-indigo-500/30 hover:shadow-indigo-500/50"
                    >
                        <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                        Create New Course
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-6 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

            {isLoading && courses.length === 0 ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : courses.length === 0 ? (
                <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AcademicCapIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No courses yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
                        Get started by creating your first course and sharing your knowledge with the world.
                    </p>
                    <button
                        onClick={() => navigate('/courses/create')}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
                    >
                        Create Your First Course
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Course Details
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Subject
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Stats
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                                                    {course.title.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                        <Link to={`/courses/${course.id}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                                                            {course.title}
                                                        </Link>
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                                        {course.description || 'No description'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {course.major?.name || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white flex flex-col space-y-1">
                                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                                    <UsersIcon className="w-4 h-4 mr-1.5" />
                                                    <span className="font-medium">{course._count?.enrollments || 0} students</span>
                                                </div>
                                                <div className="flex items-center text-gray-500 dark:text-gray-400">
                                                    <CurrencyDollarIcon className="w-4 h-4 mr-1.5 text-green-500" />
                                                    <span className="font-medium">{Number(course.price)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-3">
                                                <Link
                                                    to={`/courses/${course.id}`}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                    title="Edit Course"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(course.id, course.title)}
                                                    disabled={isDeleting === course.id}
                                                    className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete Course"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
