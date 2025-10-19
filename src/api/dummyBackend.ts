export interface Institution {
    institution_id: string;
    name: string;
}

export const authUser = async (userDetails: object): Promise<object> => {
    console.log('loginDetails :>> ', userDetails);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
    return {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        username: 'student_john',
        display_name: 'John Doe',
        email: 'john.doe@student.com',
    };
};

// src/api/mock/{mockUsers.ts

// Base User Interface (shared properties)
interface BaseUser {
    user_id: string;
    username: string;
    display_name: string;
    email: string;
    password_hash: string;
    two_fa_enabled: boolean;
    two_fa_secret: string | null;
    created_at: string;
    updated_at: string;
    last_login: string;
}

// Student Interface
export interface Student extends BaseUser {
    role: 'Student';
    student_id: string;
    grade_level?: number;
    school_name?: string;
    enrollment_date: string;
    permissions: string[];
}

// Teacher Interface
export interface Teacher extends BaseUser {
    role: 'Teacher';
    teacher_id: string;
    department?: string;
    subjects: string[];
    school_name?: string;
    permissions: string[];
}

// PrimeUser Interface (Admin)
export interface PrimeUser extends BaseUser {
    role: 'PrimeUser';
    admin_level: number;
    permissions: string[];
}

// Mock Student Object
export const mockStudent: Student = {
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    username: 'student_john',
    display_name: 'John Doe',
    email: 'john.doe@student.com',
    password_hash: '$2b$12$StudentHashExample123456789012345678901234567890',
    role: 'Student',
    student_id: 'STU-2025-001',
    grade_level: 10,
    school_name: 'Central High School',
    enrollment_date: '2024-09-01T08:00:00Z',
    two_fa_enabled: false,
    two_fa_secret: null,
    created_at: '2024-09-01T08:00:00Z',
    updated_at: '2025-10-18T14:20:00Z',
    last_login: '2025-10-19T09:15:23Z',
    permissions: ['view_courses', 'submit_assignments'],
};

// Mock Teacher Object
export const mockTeacher: Teacher = {
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    username: 'teacher_smith',
    display_name: 'Dr. Jane Smith',
    email: 'jane.smith@teacher.com',
    password_hash: '$2b$12$TeacherHashExample123456789012345678901234567890',
    role: 'Teacher',
    teacher_id: 'TCH-2025-042',
    department: 'Science',
    subjects: ['Biology', 'Chemistry', 'Health Education'],
    school_name: 'Central High School',
    two_fa_enabled: true,
    two_fa_secret: 'JASMY3DEPP3PXQ',
    created_at: '2023-08-15T10:00:00Z',
    updated_at: '2025-10-18T14:20:00Z',
    last_login: '2025-10-19T08:30:12Z',
    permissions: ['view_courses', 'submit_assignments'],
};

// Mock PrimeUser Object (Admin)
export const mockPrimeUser: PrimeUser = {
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'prime_admin',
    display_name: 'WQ-Health',
    email: 'admin@seriousgame.com',
    password_hash:
        '$2b$12$KIXp8v2XzL8e8v2XzL8e8v2XzL8e8v2XzL8e8v2XzL8e8v2XzL8e8',
    role: 'PrimeUser',
    admin_level: 1,
    permissions: ['all', 'manage_users', 'manage_modules', 'view_analytics'],
    two_fa_enabled: true,
    two_fa_secret: 'JASMY3DEPP3PXQ',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-10-18T14:20:00Z',
    last_login: '2025-10-18T14:15:23Z',
};

// Helper function to get user by role
export const getUserByRole = (
    role: 'Student' | 'Teacher' | 'PrimeUser'
): Student | Teacher | PrimeUser => {
    switch (role) {
        case 'Student':
            return mockStudent;
        case 'Teacher':
            return mockTeacher;
        case 'PrimeUser':
            return mockPrimeUser;
        default:
            throw new Error(`Unknown role: ${role}`);
    }
};
