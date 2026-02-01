import {
    Home,
    Search as SearchIcon,
    Gamepad2,
    Plus,
    MessageSquare,
    Settings as SettingsIcon,
    SplinePointer,
    Upload,
    Hand,
    MousePointer2,
} from 'lucide-react';
import type { CommandBarGroup } from '../types/command-bar.types';

export const getGroupById = (id: string) =>
    BAR_GROUPS.find((group) => group.id === id);

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
                icon: SplinePointer,
                to: '/teacher/game-studio',
            },
            {
                id: 'upload',
                labelKey: 'navigation.upload',
                icon: Upload,
                actionId: 'upload',
            },
            {
                id: "add-new",
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
                actionId: 'upload',
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
        id: 'game-studio',
        items: [
            {
                id: 'pan',
                labelKey: 'navigation.pan',
                icon: Hand,
                actionId: 'pan',
            },
            {
                id: 'select',
                labelKey: 'navigation.select',
                icon: MousePointer2,
                actionId: 'select',
            },
        ],
    },
];
