import {
    BarChart,
    Building2,
    FolderOpen,
    Gamepad2,
    GraduationCap,
    HardDrive,
    LayoutGrid,
    LayoutList,
    Shapes,
    User,
    Users2,
    type LucideIcon,
} from 'lucide-react';

export interface DashboardTab {
    id: string;
    label: string;
    icon: LucideIcon;
}

export const teacherDashboardTabs: DashboardTab[] = [
    { id: 'courses', label: 'Courses', icon: Shapes },
    { id: 'files', label: 'Files', icon: FolderOpen },
    { id: 'students', label: 'Students', icon: Users2 },
    // { id: 'todos', label: 'Todos', icon: LayoutList },
];

export const studentDashboardTabs: DashboardTab[] = [
    { id: 'courses', label: 'Courses', icon: Shapes },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'todos', label: 'Todos', icon: LayoutList },
];
export const adminDashboard: DashboardTab[] = [
    // { id: 'courses', label: 'Courses', icon: Shapes },
    // { id: 'games', label: 'Games', icon: Gamepad2 },
    // { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    // { id: 'students', label: 'Students', icon: Users2 },
    // { id: 'todos', label: 'Todos', icon: LayoutList },
    { id: 'forms', label: 'Forms', icon: Building2     },
    { id: 'database', label: 'Database', icon: HardDrive },
    { id: 'overview', label: 'Overview', icon: LayoutGrid     },
    { id: 'analytics', label: 'Analytics', icon: BarChart       },
];

export type Roles = 'teacher' | 'student' | 'admin';

export function getDashboardTabs(role: Roles): DashboardTab[] {
    if (role === 'teacher') {
        return teacherDashboardTabs;
    } else if (role === 'student') {
        return studentDashboardTabs;
    } else if (role === 'admin') {
        return adminDashboard;
    }
    throw new Error('Invalid role');
}
