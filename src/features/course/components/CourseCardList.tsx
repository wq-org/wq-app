import { CourseCard } from './CourseCard'
import type { CourseCardProps } from '../types/course.types'

interface CourseCardListProps {
  courses: CourseCardProps[]
  onCourseView?: (id: string) => void
}

export function CourseCardList({ courses, onCourseView }: CourseCardListProps) {
  return (
    <div className="flex gap-10 flex-wrap animate-in fade-in-0 slide-in-from-bottom-4">
      {courses.map((course, idx) => (
        <div
          key={idx}
          className="animate-in fade-in-0 slide-in-from-bottom-3"
        >
          <CourseCard
            {...course}
            onView={(id) => onCourseView?.(id)}
          />
        </div>
      ))}
    </div>
  )
}
