import type { Student, Teacher, Admin } from '@/types/user.types';

export const loginUser = async (userDetails: object): Promise<object> => {
    console.log('loginDetails :>> ', userDetails);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
    return {
        status: 'success',
        message: 'User authenticated successfully',
        data: mockTeacher,
    };
};

export const signupUser = async (userDetails: object): Promise<object> => {
    console.log('registerDetails :>> ', userDetails);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2-second delay
    return {
        status: 'success',
        message: 'User registered successfully',
        data: mockTeacher,
    };
};

// Mock Student Object
export const mockStudent: Student = {
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    username: 'student_john',
    display_name: 'John Doe',
    email: 'john.doe@student.com',
    password_hash: '$2b$12$StudentHashExample123456789012345678901234567890',
    role: 'student',
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
    role: 'teacher',
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
export const mockPrimeUser: Admin = {
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    username: 'prime_admin',
    display_name: 'WQ-Health',
    email: 'admin@seriousgame.com',
    password_hash:
        '$2b$12$KIXp8v2XzL8e8v2XzL8e8v2XzL8e8v2XzL8e8v2XzL8e8v2XzL8e8',
    role: 'admin',
    admin_level: 1,
    permissions: ['all', 'manage_users', 'manage_modules', 'view_analytics'],
    two_fa_enabled: true,
    two_fa_secret: 'JASMY3DEPP3PXQ',
    created_at: '2025-01-15T10:30:00Z',
    updated_at: '2025-10-18T14:20:00Z',
    last_login: '2025-10-18T14:15:23Z',
    description: 'Administrator of WQ-Health Platform',
};

// Helper function to get user by role
export const getUserByRole = (
    role: 'Student' | 'Teacher' | 'PrimeUser'
): Student | Teacher | Admin => {
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
