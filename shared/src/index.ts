// Export shared types, interfaces, enums, etc.

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
}
