import {
    FolderOpen,
    Gamepad2,
    GraduationCap,
    HardDrive,
    LayoutList,
    Shapes,
    Users2,
    type LucideIcon,
} from 'lucide-react';

export interface DashboardTab {
    id: string;
    label: string;
    icon: LucideIcon;
}

export const teacherDashboardTabs: DashboardTab[] = [
    { id: 'modules', label: 'Modules', icon: Shapes },
    { id: 'database', label: 'Database', icon: FolderOpen },
    { id: 'students', label: 'Students', icon: Users2 },
    { id: 'todos', label: 'Todos', icon: LayoutList },
];

export const studentDashboardTabs: DashboardTab[] = [
    { id: 'modules', label: 'Modules', icon: Shapes },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    { id: 'todos', label: 'Todos', icon: LayoutList },
];
export const adminDashboard: DashboardTab[] = [
    { id: 'modules', label: 'Modules', icon: Shapes },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'teachers', label: 'Teachers', icon: GraduationCap },
    { id: 'database', label: 'Database', icon: HardDrive },
    { id: 'students', label: 'Students', icon: Users2 },
    { id: 'todos', label: 'Todos', icon: LayoutList },
];

type Roles = 'teacher' | 'student' | 'admin';

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
