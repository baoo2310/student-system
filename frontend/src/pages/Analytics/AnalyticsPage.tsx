import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { UserRole } from '@shared/index';
import {
    analyticsApi,
    type InstructorAnalytics,
    type StudentAnalytics,
    type AdminAnalytics,
} from '../../api/analytics.api';
import {
    AcademicCapIcon,
    UserGroupIcon,
    StarIcon,
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon,
    ChartBarIcon,
    UsersIcon,
    ArrowTrendingUpIcon,
    ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// ─── Shared Components ────────────────────────────────────────────────────────

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color = 'blue',
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'indigo';
}) {
    const colorMap = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex items-start gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-500" />
            {children}
        </h2>
    );
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <StarSolid
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'}`}
                />
            ))}
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
        </div>
    );
}

// ─── Instructor View ──────────────────────────────────────────────────────────

function InstructorDashboard({ data }: { data: InstructorAnalytics }) {
    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={BookOpenIcon} label="Total Courses" value={data.totalCourses} color="blue" />
                <StatCard icon={UserGroupIcon} label="Total Students" value={data.totalStudents} color="green" />
                <StatCard icon={StarIcon} label="Average Rating" value={data.avgRating > 0 ? `${data.avgRating} / 5` : 'No ratings'} color="amber" sub="across all courses" />
            </div>

            {/* Course Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <SectionTitle>Course Breakdown</SectionTitle>
                </div>
                {data.courseBreakdown.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-500 py-10">No courses yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Students</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reviews</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {data.courseBreakdown.map(course => (
                                    <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/courses/${course.id}`} className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                                                {course.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-400">{course.enrollments}</td>
                                        <td className="px-4 py-4 text-center text-gray-600 dark:text-gray-400">{course.reviews}</td>
                                        <td className="px-4 py-4 text-center"><StarRating rating={course.avgRating} /></td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">${Number(course.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Student View ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
    ACTIVE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    DROPPED: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

function StudentDashboard({ data }: { data: StudentAnalytics }) {
    const DAY_ABBREV: Record<string, string> = {
        MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
    };

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={AcademicCapIcon} label="Total Enrolled" value={data.totalEnrolled} color="blue" />
                <StatCard icon={BookOpenIcon} label="Active" value={data.activeCount} color="indigo" />
                <StatCard icon={CheckCircleIcon} label="Completed" value={data.completedCount} color="green" />
                <StatCard icon={ClockIcon} label="Dropped" value={data.droppedCount} color="red" />
            </div>

            {/* Enrolled Courses */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <SectionTitle>My Enrollments</SectionTitle>
                </div>
                {data.courseList.length === 0 ? (
                    <p className="text-center text-gray-400 dark:text-gray-500 py-10">No enrollments yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.courseList.map(e => (
                            <li key={e.enrollmentId} className="px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <Link
                                        to={`/courses/${e.course.id}`}
                                        className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate block"
                                    >
                                        {e.course.title}
                                    </Link>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                        by {e.course.instructor.username}
                                        {e.course.major && ` · ${e.course.major.name}`}
                                    </p>
                                    {e.course.schedules.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {e.course.schedules.map((s, i) => (
                                                <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                                                    {DAY_ABBREV[s.dayOfWeek] ?? s.dayOfWeek}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[e.status] ?? ''}`}>
                                    {e.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

// ─── Admin View ───────────────────────────────────────────────────────────────

function AdminDashboardView({ data }: { data: AdminAnalytics }) {
    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                <StatCard icon={UsersIcon} label="Total Users" value={data.totalUsers} color="blue" />
                <StatCard icon={AcademicCapIcon} label="Students" value={data.studentCount} color="indigo" />
                <StatCard icon={ShieldCheckIcon} label="Instructors" value={data.instructorCount} color="purple" />
                <StatCard icon={BookOpenIcon} label="Courses" value={data.totalCourses} color="blue" />
                <StatCard icon={ArrowTrendingUpIcon} label="Active Enrollments" value={data.activeEnrollments} color="green" />
                <StatCard icon={CheckCircleIcon} label="Completed Courses" value={data.completedEnrollments} color="green" />
                <StatCard icon={StarIcon} label="Total Reviews" value={data.totalReviews} color="amber" />
                <StatCard icon={ClockIcon} label="Pending Matches" value={data.pendingMatches} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <SectionTitle>Recent Users</SectionTitle>
                        <Link to="/admin" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.recentUsers.map(u => (
                            <li key={u.id} className="px-6 py-3 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">{u.username}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                                </div>
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                    {u.role}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Recent Courses */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <SectionTitle>Recent Courses</SectionTitle>
                        <Link to="/courses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all →</Link>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.recentCourses.map(c => (
                            <li key={c.id} className="px-6 py-3 flex items-center justify-between">
                                <div>
                                    <Link to={`/courses/${c.id}`} className="font-medium text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400">
                                        {c.title}
                                    </Link>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">by {c.instructor.username}</p>
                                </div>
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{c._count.enrollments} students</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
    const { currentUser } = useSelector((state: RootState) => state.user);
    const [isLoading, setIsLoading] = useState(true);
    const [instructorData, setInstructorData] = useState<InstructorAnalytics | null>(null);
    const [studentData, setStudentData] = useState<StudentAnalytics | null>(null);
    const [adminData, setAdminData] = useState<AdminAnalytics | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                if (currentUser?.role === UserRole.INSTRUCTOR) {
                    const res = await analyticsApi.getInstructorAnalytics();
                    if (res.success) setInstructorData(res.data);
                } else if (currentUser?.role === UserRole.STUDENT) {
                    const res = await analyticsApi.getStudentAnalytics();
                    if (res.success) setStudentData(res.data);
                } else if (currentUser?.role === UserRole.ADMIN) {
                    const res = await analyticsApi.getAdminAnalytics();
                    if (res.success) setAdminData(res.data);
                }
            } catch {
                toast.error('Failed to load analytics');
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [currentUser]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const roleTitle: Record<string, string> = {
        INSTRUCTOR: 'Instructor Analytics',
        STUDENT: 'My Learning Overview',
        ADMIN: 'Platform Analytics',
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {roleTitle[currentUser?.role ?? ''] ?? 'Analytics'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {currentUser?.role === UserRole.INSTRUCTOR && 'Track how your courses are performing.'}
                    {currentUser?.role === UserRole.STUDENT && 'See your learning progress at a glance.'}
                    {currentUser?.role === UserRole.ADMIN && 'Monitor platform activity and growth.'}
                </p>
            </div>

            {currentUser?.role === UserRole.INSTRUCTOR && instructorData && (
                <InstructorDashboard data={instructorData} />
            )}
            {currentUser?.role === UserRole.STUDENT && studentData && (
                <StudentDashboard data={studentData} />
            )}
            {currentUser?.role === UserRole.ADMIN && adminData && (
                <AdminDashboardView data={adminData} />
            )}
        </div>
    );
}
