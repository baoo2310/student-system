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
    CheckCircleIcon,
    PlusIcon
} from '@heroicons/react/24/outline';
import ReviewSection from './ReviewSection';
import { scheduleApi } from '../../api/schedule.api';

export default function CourseDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { currentCourse: course, isLoading, error } = useSelector((state: RootState) => state.course);
    const { currentUser } = useSelector((state: RootState) => state.user);
    const { myEnrollments, isLoading: isEnrolling } = useSelector((state: RootState) => state.enrollment);

    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);

    // Schedule form state
    const [isAddingSchedule, setIsAddingSchedule] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        dayOfWeek: 'MONDAY',
        startTime: '08:00',
        endTime: '10:00',
        meetingLink: ''
    });
    const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

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

    const handleAddSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course) return;

        setIsSubmittingSchedule(true);
        try {
            await scheduleApi.createSchedule({
                courseId: course.id,
                dayOfWeek: scheduleForm.dayOfWeek,
                startTime: scheduleForm.startTime,
                endTime: scheduleForm.endTime,
                meetingLink: scheduleForm.meetingLink
            });
            toast.success('Schedule added successfully!');
            setIsAddingSchedule(false);
            setScheduleForm({ dayOfWeek: 'MONDAY', startTime: '08:00', endTime: '10:00', meetingLink: '' });
            // Refresh course details to get new schedule
            dispatch(fetchCourseById(course.id));
        } catch (err) {
            console.error('Failed to add schedule', err);
        } finally {
            setIsSubmittingSchedule(false);
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
                                {course.avgRating !== undefined && course.avgRating > 0 && (
                                    <div className="flex items-center text-yellow-300">
                                        <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                        <span className="font-semibold text-lg">{course.avgRating.toFixed(1)}</span>
                                    </div>
                                )}
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
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <ClockIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                                    Course Schedule
                                </h2>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsAddingSchedule(!isAddingSchedule)}
                                        className="p-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
                                        title="Add Schedule"
                                    >
                                        <PlusIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {isAddingSchedule && isOwner && (
                                <form onSubmit={handleAddSchedule} className="mb-6 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm">
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Add New Session</h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Day of Week</label>
                                            <select
                                                value={scheduleForm.dayOfWeek}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            >
                                                <option value="MONDAY">Monday</option>
                                                <option value="TUESDAY">Tuesday</option>
                                                <option value="WEDNESDAY">Wednesday</option>
                                                <option value="THURSDAY">Thursday</option>
                                                <option value="FRIDAY">Friday</option>
                                                <option value="SATURDAY">Saturday</option>
                                                <option value="SUNDAY">Sunday</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={scheduleForm.startTime}
                                                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={scheduleForm.endTime}
                                                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                                                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting Link (Optional)</label>
                                            <input
                                                type="url"
                                                placeholder="https://zoom.us/j/..."
                                                value={scheduleForm.meetingLink}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmittingSchedule}
                                                className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {isSubmittingSchedule ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsAddingSchedule(false)}
                                                className="px-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 font-medium rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            )}

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

                {/* Reviews Section */}
                <div className="p-8 md:p-12 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <ReviewSection courseId={course.id} isEnrolled={isAlreadyEnrolled} isOwner={isOwner} />
                </div>
            </div>
        </div>
    );
}
