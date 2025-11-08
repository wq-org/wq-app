import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Topic {
    id: string;
    name: string;
}

interface TopicBadgeProps {
    topic: Topic;
    isSelected: boolean;
    index: number;
    onToggle: (topic: Topic) => void;
    onDelete: (topic: Topic) => void;
}

export function TopicBadge({
    topic,
    isSelected,
    index,
    onToggle,
    onDelete,
}: TopicBadgeProps) {
    return (
        <div
            key={topic.id}
            onClick={() => onToggle(topic)}
            className="flex items-center gap-2 rounded-full py-2 px-4 text-base font-semibold transition hover:scale-105 active:scale-95 duration-200 animate-in fade-in slide-in-from-bottom-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {isSelected && (
                <Badge
                    variant="default"
                    className="rounded-full animate-in zoom-in-50 duration-200 hover:scale-95 active:scale-90 transition-all text-white p-0.5"
                >
                    <Check className="w-4 h-4 text-white" />
                </Badge>
            )}
            <span className="animate-in fade-in slide-in-from-top-1 duration-200">
                {topic.name}
            </span>
            <Separator orientation="vertical" className="h-full bg-gray-300" />
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(topic);
                }}
            >
                <X className="w-4 h-4 text-red-500" />
             </Button    >
        </div>
    );
}

