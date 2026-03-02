import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourseById, clearCurrentCourse } from '../../store/courseSlice';
import { enrollInCourse, fetchMyEnrollments } from '../../store/enrollmentSlice';
import type { RootState, AppDispatch } from '../../store/store';
import { UserRole } from '@shared/index';
import toast from 'react-hot-toast';
import {
    ClockIcon,
    UserIcon,
    CurrencyDollarIcon,
    VideoCameraIcon,
    ArrowLeftIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { currentCourse: course, isLoading, error } = useSelector((state: RootState) => state.course);
    const { currentUser } = useSelector((state: RootState) => state.user);
    const { myEnrollments, isLoading: isEnrolling } = useSelector((state: RootState) => state.enrollment);

    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);

    useEffect(() => {
        if (id) {
            dispatch(fetchCourseById(id));
            if (currentUser?.role === UserRole.STUDENT) {
                dispatch(fetchMyEnrollments());
            }
        }
        return () => {
            dispatch(clearCurrentCourse());
        };
    }, [dispatch, id, currentUser]);

    useEffect(() => {
        if (course && myEnrollments.length > 0) {
            const enrolled = myEnrollments.some(e => e.courseId === course.id);
            setIsAlreadyEnrolled(enrolled);
        }
    }, [course, myEnrollments]);

    const handleEnroll = async () => {
        if (!course) return;

        try {
            await dispatch(enrollInCourse(course.id)).unwrap();
            toast.success('Successfully enrolled in the course!');
            setIsAlreadyEnrolled(true);
            // Could technically redirect to StudentDashboard here, but staying on page is fine
        } catch (err: any) {
            // Error is handled by axios interceptor usually, but unwrap throws the rejected payload
            console.error('Enrollment Failed', err);
        }
    };

    if (isLoading && !course) {
        return (
            <div className="min-h-screen flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="max-w-3xl mx-auto py-20 px-4 text-center">
                <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-xl border border-red-200 dark:border-red-800">
                    <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">Course Not Found</h3>
                    <p className="text-red-600 dark:text-red-300 mb-6">{error || 'The course you are looking for does not exist.'}</p>
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    const isStudent = currentUser?.role === UserRole.STUDENT;
    const isOwner = currentUser?.id === course.instructorId;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in pb-24">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Header Section */}
                <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                        <div className="flex-1">
                            {course.major && (
                                <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-100 text-xs font-semibold uppercase tracking-wider rounded-full mb-4 border border-blue-400/30 backdrop-blur-sm">
                                    {course.major.name}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                                {course.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                                <div className="flex items-center">
                                    <UserIcon className="w-5 h-5 mr-1.5 opacity-70" />
                                    <span>{course.instructor?.username}</span>
                                </div>
                                <div className="flex items-center">
                                    <CurrencyDollarIcon className="w-5 h-5 mr-1.5 opacity-70" />
                                    <span className="font-semibold text-white text-lg">${Number(course.price)}</span>
                                </div>
                                <div className="flex items-center bg-white/10 px-3 py-1 rounded-full border border-white/10">
                                    <span className="font-medium">{course._count?.enrollments || 0} students enrolled</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div>
                            {isStudent && !isAlreadyEnrolled && (
                                <button
                                    onClick={handleEnroll}
                                    disabled={isEnrolling}
                                    className="w-full md:w-auto px-8 py-3 bg-white text-blue-700 hover:bg-gray-50 focus:ring-4 focus:ring-blue-300 font-bold rounded-xl shadow-lg transform transition hover:-translate-y-1 flex items-center justify-center disabled:opacity-70 disabled:hover:translate-y-0"
                                >
                                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                                </button>
                            )}
                            {isStudent && isAlreadyEnrolled && (
                                <div className="px-6 py-3 bg-green-500/20 text-green-100 font-bold rounded-xl border border-green-400/30 flex items-center backdrop-blur-sm">
                                    <CheckCircleIcon className="w-6 h-6 mr-2" />
                                    You are enrolled
                                </div>
                            )}
                            {isOwner && (
                                <Link
                                    to={`/my-courses?edit=${course.id}`} // Simple hint for the MyCourses page if needed
                                    className="w-full md:w-auto px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl border border-white/30 backdrop-blur-sm transition flex items-center justify-center"
                                >
                                    Manage Course
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column (Description) */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About This Course</h2>
                            <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {course.description || <span className="italic opacity-70">No description provided.</span>}
                            </div>
                        </section>

                        <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 mt-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                                <UserIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                                Meet the Instructor
                            </h2>
                            <div className="flex items-start space-x-4">
                                {course.instructor?.avatarUrl ? (
                                    <img src={course.instructor.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-md" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md">
                                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                            {course.instructor?.username[0].toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{course.instructor?.username}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{course.major?.name || 'Instructor'}</p>
                                    <Link to={`/instructors/${course.instructorId}`} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                        View Full Profile →
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Schedule) */}
                    <div>
                        <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-6 border border-blue-100 dark:border-gray-700 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <ClockIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                                Course Schedule
                            </h2>

                            {course.schedules && course.schedules.length > 0 ? (
                                <ul className="space-y-4">
                                    {course.schedules.map((schedule) => {
                                        const startTime = new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        const endTime = new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <li key={schedule.id} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                <div className="font-bold text-gray-900 dark:text-white text-lg capitalize mb-1">
                                                    {schedule.dayOfWeek.toLowerCase()}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center mb-3">
                                                    <ClockIcon className="w-4 h-4 mr-1.5 opacity-70" />
                                                    {startTime} - {endTime}
                                                </div>
                                                {schedule.meetingLink && (isAlreadyEnrolled || isOwner) ? (
                                                    <a
                                                        href={schedule.meetingLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors w-full justify-center"
                                                    >
                                                        <VideoCameraIcon className="w-4 h-4 mr-1.5" />
                                                        Join Meeting
                                                    </a>
                                                ) : schedule.meetingLink && !isAlreadyEnrolled ? (
                                                    <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded text-center">
                                                        Enroll to see link
                                                    </div>
                                                ) : null}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <ClockIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p>No schedule defined yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
