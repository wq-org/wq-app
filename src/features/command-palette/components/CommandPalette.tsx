import * as Dialog from '@radix-ui/react-dialog';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type {
    CommandBarItem,
    CommandBarGroup,
    ActionId,
} from '../types/command-bar.types';
import { getBarGroups } from '../config/commandBarGroups';

import type { CommandPaletteProps } from '../types/command-bar.types';
import { getGroupById } from '../config/commandBarGroups';
import { useUser } from '@/contexts/user';
import type { Roles } from '@/lib/dashboard-config';
import Container from '@/components/common/Container';
import { ScrollArea } from '@/components/ui/scroll-area';
import CommandSearchDialog from './CommandSearchDialog';
import CommandFeedbackDialog from './CommandFeedbackDialog';
import CommandUploadDialog from './CommandUploadDialog';
import CommandAddDialog from './CommandAddDialog';
import RestrictedCommandPalette from './RestrictedCommandPalette';

export default function CommandPalette({
    role,
    className,
    onCourseCreated,
    onFilesUploaded
}: CommandPaletteProps) {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string>('');
    // Track which dialog component to render when opened
    const [activeDialog, setActiveDialog] = useState<ActionId | undefined>(
        undefined
    );

    const navigate = useNavigate();
    const { getRole } = useUser();
    
    // Get role from context or fallback to prop, ensure it's a valid Roles type
    const contextRole = getRole();
    const userRole: Roles = (contextRole || role) as Roles;
    
    // Validate role exists - show restricted component if invalid
    const isValidRole = userRole && ['teacher', 'student', 'admin'].includes(userRole);
    
    if (!isValidRole) {
        console.error('Invalid role provided to CommandPalette:', userRole);
        return <RestrictedCommandPalette />;
    }

    // Centralized handlers for imperative actions referenced by actionId
    const actionHandlers: Partial<Record<ActionId, () => void>> = {
        search: () => handleOnClickSearchDialog(),
        upload: () => handleOnClickUploadDialog(),
        feedback: () => handleOnClickFeedbackDialog(),
        add: () => handleOnClickAddNewDialog(),
        backwards: () => window.history.back(),
        forwards: () => window.history.forward(),
    };

    const commandBarGroup: CommandBarGroup[] = getBarGroups(userRole);

    function handleOnClickSearchDialog() {
        setActiveDialog('search');
        setOpen(true);
        console.log('Search dialog triggered');
    }
    
    function handleOnClickUploadDialog() {
        setActiveDialog('upload');
        setOpen(true);
        console.log('Upload dialog triggered');
    }

    function handleOnClickFeedbackDialog() {
        setActiveDialog('feedback');
        setOpen(true);
        console.log('Feedback dialog triggered');
    }
    
    function handleOnClickAddNewDialog() {
        setActiveDialog('add');
        setOpen(true);
        console.log('Add new dialog triggered');
    }

    const primaryGroup = getGroupById(userRole, userRole) ?? commandBarGroup[0];
    const defaultUserCommands = getGroupById('user', userRole);
    const userItems = defaultUserCommands?.items ?? [];
    const roleBasedUserCommands = primaryGroup?.items ?? [];

    const handleItemClick = (item: CommandBarItem) => {
        // Dispatch custom event for pan/select actions
        if (item.actionId === 'pan' || item.actionId === 'select') {
            window.dispatchEvent(new CustomEvent('command-action', {
                detail: { actionId: item.actionId }
            }));
            return;
        }
        
        if (item.actionId && actionHandlers[item.actionId]) {
            actionHandlers[item.actionId]!();
            return;
        }
        if (item.to) {
            navigate(item.to);
        }
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setActiveDialog('search');
                setOpen(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <>
            <Tooltip.Provider delayDuration={200}>
                <div
                    className={cn(
                        className,
                        'fixed inset-x-0 bottom-8 z-50 mx-auto flex items-center justify-center rounded-full border bg-background/80 backdrop-blur shadow-xl px-4 py-3 w-fit'
                    )}
                    role="region"
                    aria-label="Quick actions"
                >
                    <Toolbar.Root className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            {/* First group: first three items */}
                            <ToggleGroup.Root
                                type="single"
                                value={active}
                                onValueChange={(v) => setActive(v || '')}
                                orientation="horizontal"
                                aria-label="primary actions"
                                className="flex items-center gap-3"
                            >
                                {roleBasedUserCommands
                                    .slice(0, 3)
                                    .map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <Tooltip.Root key={item.id}>
                                                <Tooltip.Trigger asChild>
                                                    <ToggleGroup.Item
                                                        value={item.id}
                                                        onClick={() =>
                                                            handleItemClick(
                                                                item
                                                            )
                                                        }
                                                        className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
                                                        aria-label={
                                                            item.labelKey
                                                        }
                                                    >
                                                        <Icon className="h-6 w-6" />
                                                        <VisuallyHidden>
                                                            {item.labelKey}
                                                        </VisuallyHidden>
                                                    </ToggleGroup.Item>
                                                </Tooltip.Trigger>
                                                <Tooltip.Portal>
                                                    <Tooltip.Content
                                                        side="top"
                                                        sideOffset={8}
                                                        className="rounded-md border bg-popover px-2 py-1 text-xs shadow"
                                                    >
                                                        {item.labelKey}
                                                        <Tooltip.Arrow className="fill-popover" />
                                                    </Tooltip.Content>
                                                </Tooltip.Portal>
                                            </Tooltip.Root>
                                        );
                                    })}
                            </ToggleGroup.Root>

                            {/* Separator after third icon */}
                            <Separator.Root
                                decorative
                                orientation="vertical"
                                className="mx-2 h-12 w-px bg-border"
                            />

                            {/* Remaining primary items */}
                            <ToggleGroup.Root
                                type="single"
                                value={active}
                                onValueChange={(v) => setActive(v || '')}
                                orientation="horizontal"
                                aria-label="primary actions continued"
                                className="flex items-center gap-3"
                            >
                                {roleBasedUserCommands.slice(3).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Tooltip.Root key={item.id}>
                                            <Tooltip.Trigger asChild>
                                                <ToggleGroup.Item
                                                    value={item.id}
                                                    onClick={() =>
                                                        handleItemClick(item)
                                                    }
                                                    className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
                                                    aria-label={item.labelKey}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                    <VisuallyHidden>
                                                        {item.labelKey}
                                                    </VisuallyHidden>
                                                </ToggleGroup.Item>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content
                                                    side="top"
                                                    sideOffset={8}
                                                    className="rounded-md border bg-popover px-2 py-1 text-xs shadow"
                                                >
                                                    {item.labelKey}
                                                    <Tooltip.Arrow className="fill-popover" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    );
                                })}
                            </ToggleGroup.Root>

                            {/* System group */}
                            <Separator.Root
                                decorative
                                orientation="vertical"
                                className="mx-2 h-12 w-px bg-border"
                            />
                            <ToggleGroup.Root
                                type="single"
                                value={active}
                                onValueChange={(v) => setActive(v || '')}
                                orientation="horizontal"
                                aria-label="system actions"
                                className="flex items-center gap-3"
                            >
                                {userItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Tooltip.Root key={item.id}>
                                            <Tooltip.Trigger asChild>
                                                <ToggleGroup.Item
                                                    value={item.id}
                                                    onClick={() =>
                                                        handleItemClick(item)
                                                    }
                                                    className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
                                                    aria-label={item.labelKey}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                    <VisuallyHidden>
                                                        {item.labelKey}
                                                    </VisuallyHidden>
                                                </ToggleGroup.Item>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content
                                                    side="top"
                                                    sideOffset={8}
                                                    className="rounded-md border bg-popover px-2 py-1 text-xs shadow"
                                                >
                                                    {item.labelKey}
                                                    <Tooltip.Arrow className="fill-popover" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    );
                                })}
                            </ToggleGroup.Root>
                        </div>
                    </Toolbar.Root>
                </div>
            </Tooltip.Provider>

            {/* Searchable dialog palette */}
            <Dialog.Root
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) setActiveDialog(undefined);
                }}
            >
                <Dialog.Portal>
                    <Dialog.Content
                        className={
                            'fixed bottom-30 rounded-4xl left-1/2 z-50 w-full max-w-lg -translate-x-1/2  border bg-white   overflow-hidden flex flex-col'
                        }
                    >
                        <Dialog.Title className="sr-only">
                            Command Palette
                        </Dialog.Title>
                        <Dialog.Description className="sr-only">
                            Quick access to search, upload, feedback, and other actions
                        </Dialog.Description>
                        <ScrollArea className="flex-1 h-[100px] overflow-y-auto ">
                            <Container className="px-4 py-2">
                                {activeDialog === 'search' && (
                                    <CommandSearchDialog />
                                )}
                                {activeDialog === 'upload' && <CommandUploadDialog onSuccess={onFilesUploaded} />}
                                {activeDialog === 'feedback' && (
                                    <CommandFeedbackDialog />
                                )}
                                {activeDialog === 'add' && (
                                    <CommandAddDialog role={role} onSuccess={onCourseCreated} />
                                )}
                            </Container>
                        </ScrollArea>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
