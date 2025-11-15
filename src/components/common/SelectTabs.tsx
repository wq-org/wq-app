import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TabItem {
    id: string;
    icon: LucideIcon;
    title: string;
}

interface SelectTabsProps {
    tabs: TabItem[];
    activeTabId: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

export default function SelectTabs({
    tabs,
    activeTabId,
    onTabChange,
    className = '',
}: SelectTabsProps) {
    return (
        <div className={cn('flex gap-12', className)}>
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTabId === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'flex items-center gap-2 border-b-2 pb-2 focus:outline-none transition-all',
                            isActive
                                ? 'border-black text-black font-medium'
                                : 'border-transparent text-black/40 hover:text-black/60'
                        )}
                    >
                        <Icon className={isActive ? 'text-black' : 'text-black/40'} />
                        <span className={cn(
                            'text-xl',
                            isActive ? 'text-black font-medium' : 'text-black/40 hover:text-black/60'
                        )}>
                            {tab.title}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
