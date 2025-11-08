import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, X } from 'lucide-react';

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
        <Button
            key={topic.id}
            onClick={() => onToggle(topic)}
            variant="secondary"
            className="flex items-center gap-2 rounded-full py-2 text-base font-semibold transition hover:scale-105 active:scale-95 duration-200 animate-in fade-in slide-in-from-bottom-2"
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
            <Separator orientation="vertical" className="h-4 bg-black" />
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(topic);
                }}
                className="rounded-full hover:scale-105 active:scale-95 transition-all duration-200 h-6 w-6"
            >
                <X className="w-4 h-4 text-red-500" />
            </Button>
        </Button>
    );
}

