import * as Dialog from '@radix-ui/react-dialog';
import * as Toolbar from '@radix-ui/react-toolbar';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Separator from '@radix-ui/react-separator';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useNavigate } from 'react-router-dom';

import {
    Home,
    Settings as SettingsIcon,
    Upload,
    Search as SearchIcon,
    HandHelping,
    ToyBrick,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';

type CommandItem = {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    action: () => void | Promise<void>;
};

type CommandGroup = {
    id: string;
    items: CommandItem[];
};

const searchCommands = [
    { id: 'home', label: 'Go to Home', category: 'Navigation' },
    { id: 'settings', label: 'Open Settings', category: 'Navigation' },
    { id: 'game-studio', label: 'Game Studio', category: 'Navigation' },
    { id: 'feedback', label: 'Send Feedback', category: 'Actions' },
    { id: 'upload', label: 'Upload File', category: 'Actions' },
];

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [active, setActive] = useState<string | undefined>(undefined);

    const barGroups: CommandGroup[] = [
        {
            id: 'primary',
            items: [
                {
                    id: 'home',
                    label: 'Home',
                    icon: Home,
                    action: () => navigateTo('dashboard'),
                },

                {
                    id: 'search',
                    label: 'Search',
                    icon: SearchIcon,
                    action: () => console.log('Search'),
                },
                {
                    id: 'studio',
                    label: 'Game Studio',
                    icon: ToyBrick,
                    action: () => console.log('Game Studio'),
                },

                {
                    id: 'upload',
                    label: 'Upload',
                    icon: Upload,
                    action: () => console.log('Upload'),
                },
            ],
        },
        {
            id: 'system',
            items: [
                {
                    id: 'Feedback',
                    label: 'Feedback',
                    icon: HandHelping,
                    action: () => console.log('Brightness'),
                },
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: SettingsIcon,
                    action: () => navigateTo('Settings'),
                },
            ],
        },
    ];

    const navigate = useNavigate();

    function navigateTo(path: string) {
        console.log(`Navigating to ${path}...`);
        navigate(`/teacher/${path}`);
    }

    // Keyboard shortcut ⌘K / Ctrl+K to open Dialog
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setOpen(true);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const filtered = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return searchCommands;
        return searchCommands.filter((c) => c.label.toLowerCase().includes(q));
    }, [searchQuery]);

    return (
        <>
            {/* Mirror bar outside the component */}
            <div className="fixed inset-x-0 bottom-20 z-40 mx-auto w-16 h-1 rounded-full bg-muted/50" />

            {/* Bottom sticky command bar */}
            <Tooltip.Provider delayDuration={200}>
                <div
                    className="
                        fixed inset-x-0 bottom-8 z-50
                        mx-auto flex items-center justify-center
                        rounded-full border bg-background/80 backdrop-blur
                        shadow-xl
                        px-4 py-3
                        w-fit
                    "
                    role="region"
                    aria-label="Quick actions"
                >
                    <Toolbar.Root className="flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <ToggleGroup.Root
                                type="single"
                                value={active}
                                onValueChange={(v) => setActive(v || undefined)}
                                orientation="horizontal"
                                aria-label="primary actions"
                                className="flex items-center gap-3"
                            >
                                {barGroups[0].items.slice(0, 3).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Tooltip.Root key={item.id}>
                                            <Tooltip.Trigger asChild>
                                                <ToggleGroup.Item
                                                    value={item.id}
                                                    onClick={() =>
                                                        item.action()
                                                    }
                                                    className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
                                                    aria-label={item.label}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                    <VisuallyHidden>
                                                        {item.label}
                                                    </VisuallyHidden>
                                                </ToggleGroup.Item>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content
                                                    side="top"
                                                    sideOffset={8}
                                                    className="rounded-md border bg-popover px-2 py-1 text-xs shadow"
                                                >
                                                    {item.label}
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

                            {/* Fourth icon from primary group */}
                            <ToggleGroup.Root
                                type="single"
                                value={active}
                                onValueChange={(v) => setActive(v || undefined)}
                                orientation="horizontal"
                                aria-label="upload action"
                                className="flex items-center gap-3"
                            >
                                {barGroups[0].items.slice(3).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Tooltip.Root key={item.id}>
                                            <Tooltip.Trigger asChild>
                                                <ToggleGroup.Item
                                                    value={item.id}
                                                    onClick={() =>
                                                        item.action()
                                                    }
                                                    className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
                                                    aria-label={item.label}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                    <VisuallyHidden>
                                                        {item.label}
                                                    </VisuallyHidden>
                                                </ToggleGroup.Item>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content
                                                    side="top"
                                                    sideOffset={8}
                                                    className="rounded-md border bg-popover px-2 py-1 text-xs shadow"
                                                >
                                                    {item.label}
                                                    <Tooltip.Arrow className="fill-popover" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    );
                                })}
                            </ToggleGroup.Root>

                            {/* System group */}
                            <ToggleGroup.Root
                                type="single"
                                value={active}
                                onValueChange={(v) => setActive(v || undefined)}
                                orientation="horizontal"
                                aria-label="system actions"
                                className="flex items-center gap-3"
                            >
                                <Separator.Root
                                    decorative
                                    orientation="vertical"
                                    className="mx-2 h-12 w-px bg-border"
                                />
                                {barGroups[1].items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Tooltip.Root key={item.id}>
                                            <Tooltip.Trigger asChild>
                                                <ToggleGroup.Item
                                                    value={item.id}
                                                    onClick={() =>
                                                        item.action()
                                                    }
                                                    className="
                                                        cursor-pointer
                                                        inline-flex h-14 w-14 items-center justify-center
                                                        rounded-full border
                                                        bg-card hover:bg-accent data-[state=on]:bg-accent
                                                        transition-colors
                                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                    "
                                                    aria-label={item.label}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                    <VisuallyHidden>
                                                        {item.label}
                                                    </VisuallyHidden>
                                                </ToggleGroup.Item>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content
                                                    side="top"
                                                    sideOffset={8}
                                                    className="rounded-md border bg-popover px-2 py-1 text-xs shadow"
                                                >
                                                    {item.label}
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
            <Dialog.Root open={open} onOpenChange={setOpen}>
                <Dialog.Portal>
                    <Dialog.Content className="fixed bottom-30 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 rounded-3xl border bg-white  max-h-[80vh] overflow-hidden">
                        <div className="flex items-center border-b px-4 py-3">
                            <Search className="mr-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Type a command or search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 outline-none text-sm"
                                autoFocus
                            />
                            <Dialog.Close asChild>
                                <button className="p-1 rounded-sm hover:bg-gray-100">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {filtered.length > 0 ? (
                                <div className="p-2">
                                    {filtered.map((command) => (
                                        <button
                                            key={command.id}
                                            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                            onClick={() => {
                                                console.log(
                                                    `Executing: ${command.label}`
                                                );
                                                setOpen(false);
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">
                                                    {command.label}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {command.category}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No commands found
                                </div>
                            )}
                        </div>

                        <Dialog.Title className="sr-only">
                            Command Palette
                        </Dialog.Title>
                        <Dialog.Description className="sr-only">
                            Search and execute commands quickly
                        </Dialog.Description>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
}
