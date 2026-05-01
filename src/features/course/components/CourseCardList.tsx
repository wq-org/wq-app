import { BlurredScrollArea } from '@/components/ui/blurred-scroll-area'
import { CourseCard } from './CourseCard'
import { CourseCardCompact } from './CourseCardCompact'
import { cn } from '@/lib/utils'
import type { CourseCardProps } from '../types/course.types'

type CourseCardListVariant = 'default' | 'compact'

export type CourseCardListProps = {
  courses: CourseCardProps[]
  onCourseView?: (id: string) => void
  variant?: CourseCardListVariant
  className?: string
  scrollAreaClassName?: string
}

export function CourseCardList({
  courses,
  onCourseView,
  variant = 'default',
  className,
  scrollAreaClassName,
}: CourseCardListProps) {
  const handleView = (id: string) => onCourseView?.(id)

  if (variant === 'compact') {
    return (
      <BlurredScrollArea
        orientation="horizontal"
        hideScrollBar
        className={cn('w-full min-h-0', scrollAreaClassName)}
        viewportClassName="pb-1"
      >
        <div className={cn('flex w-max flex-nowrap gap-3', className)}>
          {courses.map((course) => (
            <CourseCardCompact
              key={course.id}
              {...course}
              onView={handleView}
            />
          ))}
        </div>
      </BlurredScrollArea>
    )
  }

  return (
    <div
      className={cn('flex flex-wrap gap-5 animate-in fade-in-0 slide-in-from-bottom-4', className)}
    >
      {courses.map((course) => (
        <div
          key={course.id}
          className="animate-in fade-in-0 slide-in-from-bottom-3"
        >
          <CourseCard
            {...course}
            onView={handleView}
          />
        </div>
      ))}
    </div>
  )
}
