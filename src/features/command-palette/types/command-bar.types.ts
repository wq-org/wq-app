// src/features/command-palette/types/command-bar.types.ts
import type { ComponentType } from 'react';

/**
 * Known imperative actions triggered from the command bar.
 * Extend this union when new actions are introduced.
 */
export type ActionId = 'search' | 'upload' | 'feedback' | 'backwards' | 'forwards' | 'add';

/**
 * Single clickable element in the command bar.
 * Provide either `to` (navigation) or `actionId` (imperative), not both.
 */
export type CommandBarItem = {
    /** Stable programmatic id for the item. */
    id: string;
    /** i18n key used for the label, e.g., 'common.navigation.home'. */
    labelKey: string;
    /** Icon component (e.g., from lucide-react). */
    icon: ComponentType<{ className?: string }>;
    /** Route to navigate to when clicked. */
    to?: string;
    /** Imperative action identifier to execute when clicked. */
    actionId?: ActionId;
};

/**
 * Logical grouping of items in the bar.
 * Typical ids include a role group (e.g., 'teacher' | 'student'), 'general', and 'system'.
 */
export type CommandBarGroup = {
    id: string;
    items: CommandBarItem[];
};

export interface CommandPaletteProps {
    children?: React.ReactNode;
    role: string;
    type?: string;
    className?: string;
}
