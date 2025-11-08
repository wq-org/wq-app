import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { File } from 'lucide-react';
import type { Lesson } from '../types/lesson.types';

interface LessonCardProps {
    lesson: Lesson;
    index: number;
    onView?: (lessonId: string) => void;
}

export function LessonCard({ lesson, index, onView }: LessonCardProps) {
    return (
        <Card className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md h-[280px] flex flex-col">
            <div className="flex flex-col h-full">
                {/* Icon and Title */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                        <File className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 cursor-help">
                                    {index + 1}. {lesson.title}
                                </h3>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{index + 1}. {lesson.title}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Description */}
                <div className="flex-1 mb-4 min-h-0">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="text-sm text-gray-600 line-clamp-3 cursor-help">
                                {lesson.description}
                            </p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="max-w-xs">{lesson.description}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>

                {/* View Button */}
                <div className="mt-auto">
                    <Button
                        variant="default"
                        onClick={() => onView?.(lesson.id)}
                        className="w-full rounded-lg w-fit bg-gray-900 px-6 text-sm font-medium hover:bg-gray-800"
                    >
                        View
                    </Button>
                </div>
            </div>
        </Card>
    );
}

