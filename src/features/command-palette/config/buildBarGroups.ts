import { COMMAND_BAR_GROUPS } from './commandBarGroups';
import type { CommandBarGroup } from '../types/command-bar.types';

type ActionMap = {
    search?: () => void | Promise<void>;
    upload?: () => void | Promise<void>;
    feedback?: () => void | Promise<void>;
};

export function buildBarGroups(
    navigate: (to: string) => void,
    actions: ActionMap
): CommandBarGroup[] {
    return COMMAND_BAR_GROUPS.map((group) => ({
        id: group.id,
        items: group.items.map((item) => ({
            ...item,
            action: item.to
                ? () => navigate(item.to || '/')
                : () => actions[item.actionId as keyof ActionMap]?.(),
        })),
    }));
}
