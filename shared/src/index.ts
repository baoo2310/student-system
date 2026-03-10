// Export shared types, interfaces, enums, etc.

export enum UserRole {
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN',
}

export enum MatchRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

export enum NotificationTypes {
    MATCH_REQUEST = 'MATCH_REQUEST',
    MATCH_ACCEPTED = 'MATCH_ACCEPTED',
    COURSE_ENROLLMENT = 'COURSE_ENROLLMENT',
    NEW_MESSAGE = 'NEW_MESSAGE',
    COURSE_REVIEW = 'COURSE_REVIEW',
    SYSTEM = 'SYSTEM',
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    profile?: {
        bio?: string;
        hourlyRate?: string;
    };
    majors?: Major[];
}

export interface Major {
    id: string;
    name: string;
    description?: string;
}

export interface MatchRequest {
    id: string;
    student: User;
    instructor: User;
    status: MatchRequestStatus;
    createdAt: Date;
    updatedAt: Date;
}

export enum EnrollmentStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    DROPPED = 'DROPPED',
}

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

export interface Course {
    id: string;
    instructorId: string;
    majorId?: string | null;
    title: string;
    description?: string | null;
    price: string | number; // usually string from decimal in pg, or number from frontend
    createdAt: Date | string;
    updatedAt: Date | string;

    // Relations that might be included
    instructor?: User;
    major?: Major | null;
    schedules?: CourseSchedule[];
    enrollments?: Enrollment[];
    _count?: {
        enrollments: number;
    };
    reviews?: Review[];
    avgRating?: number;
}

export interface CourseSchedule {
    id: string;
    courseId: string;
    dayOfWeek: DayOfWeek;
    startTime: Date | string;
    endTime: Date | string;
    meetingLink?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;

    course?: Course;
}

export interface Enrollment {
    id: string;
    studentId: string;
    courseId: string;
    status: EnrollmentStatus;
    enrolledAt: Date | string;
    updatedAt: Date | string;

    student?: User;
    course?: Course;
}

export interface Review {
    id: string;
    courseId: string;
    studentId: string;
    rating: number;
    comment?: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    student?: User;
    course?: Course;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationTypes;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: Date | string;

    user?: User;
}

export interface Conversation {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    participants?: ConversationParticipant[];
    messages?: Message[];
}

export interface ConversationParticipant {
    conversationId: string;
    userId: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    conversation?: Conversation;
    user?: User;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date | string;

    conversation?: Conversation;
    sender?: User;
}
