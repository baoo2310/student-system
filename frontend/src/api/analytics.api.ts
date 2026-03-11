import api from './axios';

export interface InstructorAnalytics {
    totalCourses: number;
    totalStudents: number;
    avgRating: number;
    courseBreakdown: {
        id: string;
        title: string;
        enrollments: number;
        reviews: number;
        avgRating: number;
        price: number;
    }[];
}

export interface StudentAnalytics {
    totalEnrolled: number;
    activeCount: number;
    completedCount: number;
    droppedCount: number;
    courseList: {
        enrollmentId: string;
        status: string;
        enrolledAt: string;
        course: {
            id: string;
            title: string;
            instructor: { id: string; username: string; avatarUrl?: string | null };
            major?: { name: string } | null;
            schedules: { dayOfWeek: string; startTime: string; endTime: string }[];
        };
    }[];
}

export interface AdminAnalytics {
    totalUsers: number;
    studentCount: number;
    instructorCount: number;
    adminCount: number;
    totalCourses: number;
    activeEnrollments: number;
    completedEnrollments: number;
    totalReviews: number;
    pendingMatches: number;
    recentUsers: { id: string; username: string; email: string; role: string; createdAt: string }[];
    recentCourses: { id: string; title: string; createdAt: string; instructor: { username: string }; _count: { enrollments: number } }[];
}

export const analyticsApi = {
    getInstructorAnalytics: async (): Promise<{ success: boolean; data: InstructorAnalytics }> => {
        const response = await api.get('/analytics/instructor');
        return response.data;
    },
    getStudentAnalytics: async (): Promise<{ success: boolean; data: StudentAnalytics }> => {
        const response = await api.get('/analytics/student');
        return response.data;
    },
    getAdminAnalytics: async (): Promise<{ success: boolean; data: AdminAnalytics }> => {
        const response = await api.get('/analytics/admin');
        return response.data;
    },
};
