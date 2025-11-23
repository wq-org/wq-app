import CourseCard from './CourseCard'
import type { CourseCardProps } from '../types/course.types'

interface CourseCardListProps {
  courses: CourseCardProps[]
  onCourseView?: (id: string) => void
}

export default function CourseCardList({ courses, onCourseView }: CourseCardListProps) {
  return (
    <div className="flex gap-10  flex-wrap">
      {courses.map((course, idx) => (
        <CourseCard
          key={idx}
          {...course}
          onView={(id) => onCourseView?.(id)}
        />
      ))}
    </div>
  )
}
