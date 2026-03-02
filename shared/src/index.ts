// Export shared types, interfaces, enums, etc.
export enum MatchStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED'
}

export enum UserRole {
    STUDENT = 'STUDENT',
    INSTRUCTOR = 'INSTRUCTOR',
    ADMIN = 'ADMIN',
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
    status: MatchStatus;
}
