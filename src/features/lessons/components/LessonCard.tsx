import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { File } from 'lucide-react'
import type { LessonCardProps } from '../types/lesson.types'

export function LessonCard({ lesson, index, onView }: LessonCardProps) {
  return (
    <Card className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md h-[200px]   flex flex-col">
      <div className="flex flex-col h-full">
        {/* Icon and Title */}
        <div className="flex items-start gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <File className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-base font-semibold text-gray-900 line-clamp-2 cursor-help">
                  {index + 1}. {lesson.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  {index + 1}. {lesson.title}
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Description */}
        <div className="flex-1 mb-3 min-h-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-sm text-gray-600 line-clamp-3 cursor-help">
                {lesson.description || 'no description'}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{lesson.description || 'no description'}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* View Button */}
        <div className="mt-auto">
          <Button
            variant="default"
            onClick={() => onView?.(lesson.id)}
            className="w-fit rounded-lg bg-gray-900 px-6 text-sm font-medium hover:bg-gray-800"
          >
            View
          </Button>
        </div>
      </div>
    </Card>
  )
}
