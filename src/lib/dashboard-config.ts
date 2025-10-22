import {
    Gamepad2,
    HardDrive,
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
    { id: 'database', label: 'Database', icon: HardDrive },
    { id: 'students', label: 'Students', icon: Users2 },
];

export const studentDashboardTabs: DashboardTab[] = [
    { id: 'modules', label: 'Modules', icon: Shapes },
    { id: 'games', label: 'Games', icon: Gamepad2 },
];

export function getDashboardTabs(role: 'teacher' | 'student'): DashboardTab[] {
    if (role === 'teacher') {
        return teacherDashboardTabs;
    } else if (role === 'student') {
        return studentDashboardTabs;
    }
    throw new Error('Invalid role');
}
