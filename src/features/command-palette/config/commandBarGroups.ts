// src/features/command-palette/config/bar-groups.ts
import {
    Home,
    Search as SearchIcon,
    HandHelping,
    Settings as SettingsIcon,
    ChevronRight,
    ChevronLeft,
    DraftingCompass,
    Plus,
    Play,
} from 'lucide-react';
import type { CommandBarGroup } from '../types/command-bar.types';

export const COMMAND_BAR_GROUPS: CommandBarGroup[] = [
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
                icon: DraftingCompass,
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
                id: 'Play Store',
                labelKey: 'navigation.play-store',
                icon: Play,
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
        id: 'general',
        items: [
            {
                id: 'feedback',
                labelKey: 'navigation.feedback',
                icon: HandHelping,
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
                labelKey: 'navigation.forward',
                icon: ChevronLeft,
                actionId: 'backwards',
            },
            {
                id: 'forwards',
                labelKey: 'navigation.settings',
                icon: ChevronRight,
                actionId: 'forwards',
            },
        ],
    },
];
