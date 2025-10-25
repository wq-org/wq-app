import {
    Home,
    Search as SearchIcon,
    Gamepad2,
    Plus,
    MessageSquare,
    Settings as SettingsIcon,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import type { CommandBarGroup } from '../types/command-bar.types';

// Role and system groups used by the command bar. Icons are real components.
export const BAR_GROUPS: CommandBarGroup[] = [
    {
        id: 'teacher',
        items: [
            {
                id: 'home',
                labelKey: 'navigation.dashboard',
                icon: Home,
                to: '/teacher/dashboard',
            },
            {
                id: 'search',
                labelKey: 'navigation.search',
                icon: SearchIcon,
                actionId: 'search',
            },
            {
                id: 'studio',
                labelKey: 'navigation.studio',
                icon: Gamepad2,
                to: '/teacher/game-studio',
            },
            {
                id: 'add',
                labelKey: 'navigation.add-new',
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
                labelKey: 'navigation.dashboard',
                icon: Home,
                to: '/student/dashboard',
            },
            {
                id: 'search',
                labelKey: 'navigation.search',
                icon: SearchIcon,
                actionId: 'search',
            },
            {
                id: 'play-store',
                labelKey: 'navigation.play-store',
                icon: Gamepad2,
                to: '/student/play-store',
            },
            {
                id: 'add',
                labelKey: 'navigation.add-new',
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
                labelKey: 'navigation.feedback',
                icon: MessageSquare,
                actionId: 'feedback',
            },
            {
                id: 'settings',
                labelKey: 'navigation.settings',
                icon: SettingsIcon,
                to: '/teacher/settings',
            },
        ],
    },
    {
        id: 'system',
        items: [
            {
                id: 'backwards',
                labelKey: 'navigation.backwards',
                icon: ChevronLeft,
                actionId: 'backwards',
            },
            {
                id: 'forwards',
                labelKey: 'navigation.forwards',
                icon: ChevronRight,
                actionId: 'forwards',
            },
        ],
    },
];
