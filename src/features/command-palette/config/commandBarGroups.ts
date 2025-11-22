import {
    Home,
    Search as SearchIcon,
    Plus,
    Settings as SettingsIcon,
    SplinePointer,
    Upload,
    Hand,
    MousePointer2,
    Undo2,
    Redo2,
    MessagesSquare,
    UserStar,
} from 'lucide-react';
import type { CommandBarGroup } from '../types/command-bar.types';
import type { Roles } from '@/lib/dashboard-config';

/**
 * Get command bar groups with role-based routes
 * @param role - User role (required)
 * @returns Array of command bar groups with dynamic routes
 */
export const getBarGroups = (role: Roles): CommandBarGroup[] => {
    const teacherPrefix = '/teacher';
    const studentPrefix = '/student';
    const rolePrefix = `/${role}`;

    return [
        {
            id: 'teacher',
            items: [
                {
                    id: 'home',
                    labelKey: 'actions.dashboard',
                    icon: Home,
                    to: `${teacherPrefix}/dashboard`,
                },
                {
                    id: 'search',
                    labelKey: 'actions.search',
                    icon: SearchIcon,
                    actionId: 'search',
                },
                {
                    id: 'studio',
                    labelKey: 'actions.studio',
                    icon: SplinePointer,
                    to: `${teacherPrefix}/game-studio`,
                },
                {
                    id: 'chat',
                    labelKey: 'actions.chat',
                    icon: MessagesSquare,
                    to: `${teacherPrefix}/chat`,
                },
                {
                    id: 'upload',
                    labelKey: 'actions.upload',
                    icon: Upload,
                    actionId: 'upload',
                },
                {
                    id: 'add-new',
                    labelKey: 'actions.addNew',
                    icon: Plus,
                    actionId: 'add',
                },
            ],
        },
        {
            id: 'student',
            items: [
                {
                    id: 'home',
                    labelKey: 'actions.dashboard',
                    icon: Home,
                    to: `${studentPrefix}/dashboard`,
                },
                {
                    id: 'search',
                    labelKey: 'actions.search',
                    icon: SearchIcon,
                    actionId: 'search',
                },
                {
                    id: 'chat',
                    labelKey: 'actions.chat',
                    icon: MessagesSquare,
                    to: `${studentPrefix}/chat`,
                },
                {
                    id: 'add',
                    labelKey: 'actions.addNew',
                    icon: Plus,
                    actionId: 'add',
                },
            ],
        },
        {
            id: 'user',
            items: [
                {
                    id: 'feedback',
                    labelKey: 'actions.feedback',
                    icon: UserStar,
                    actionId: 'feedback',
                },
                {
                    id: 'settings',
                    labelKey: 'actions.settings',
                    icon: SettingsIcon,
                    to: `${rolePrefix}/settings`,
                },
            ],
        },
        {
            id: 'game-studio',
            items: [
                {
                    id: 'pan',
                    labelKey: 'actions.pan',
                    icon: Hand,
                    actionId: 'pan',
                },
                {
                    id: 'select',
                    labelKey: 'actions.select',
                    icon: MousePointer2,
                    actionId: 'select',
                },
                {
                    id: 'undo',
                    labelKey: 'actions.undo',
                    icon: Undo2,
                    actionId: 'undo',
                },
                {
                    id: 'redo',
                    labelKey: 'actions.redo',
                    icon: Redo2,
                    actionId: 'redo',
                },
            ],
        },
    ];
};

/**
 * Get a specific command bar group by ID
 * @param id - Group ID to find
 * @param role - User role (required)
 * @returns Command bar group or undefined if not found
 */
export const getGroupById = (id: string, role: Roles): CommandBarGroup | undefined =>
    getBarGroups(role).find((group) => group.id === id);
